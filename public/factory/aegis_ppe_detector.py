"""
AEGIS PPE detector — factory edge box (YOLO + RTSP)

    pip install -r requirements.txt
    python aegis_ppe_detector.py --ingest https://YOUR_APP/api/ingest/yolo --token aegis_live_...

Streams (repeatable):
    --stream cam-gate|rtsp://192.168.1.20/stream1
    --stream cam-ward|rtsp://192.168.1.21/live

Or env AEGIS_STREAMS=cam-gate|rtsp://...;cam-ward|rtsp://...

POST /inspect still accepts a JPEG for the SaaS console.
Without weights/ppe.pt it loads yolov8n (people only).
"""

from __future__ import annotations

import argparse
import base64
import io
import os
import threading
import time
from typing import Any

import cv2
import numpy as np
import urllib.request
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel
from ultralytics import YOLO

PPE = {
    "helmet",
    "vest",
    "goggles",
    "gloves",
    "boots",
    "mask",
    "ear",
    "harness",
    "faceshield",
    "coverall",
    "hairnet",
    "labcoat",
    "facemask",
}

ALIAS = {
    "hardhat": "helmet",
    "hard-hat": "helmet",
    "head_helmet": "helmet",
    "no-helmet": "helmet",
    "no_helmet": "helmet",
    "safety-vest": "vest",
    "safety_vest": "vest",
    "hi-vis": "vest",
    "no-vest": "vest",
    "no_vest": "vest",
    "glasses": "goggles",
    "safety-glasses": "goggles",
    "respirator": "mask",
    "face-shield": "faceshield",
    "face_shield": "faceshield",
    "ear-muff": "ear",
    "earmuff": "ear",
    "fall-harness": "harness",
    "surgical-mask": "facemask",
    "face-mask": "facemask",
    "lab-coat": "labcoat",
    "coat": "labcoat",
}

WEIGHTS = os.environ.get("PPE_WEIGHTS", os.path.join(os.path.dirname(__file__), "weights", "ppe.pt"))
FALLBACK = os.environ.get("YOLO_FALLBACK", "yolov8n.pt")


def load_model() -> YOLO:
    if os.path.isfile(WEIGHTS):
        return YOLO(WEIGHTS)
    return YOLO(FALLBACK)


MODEL = load_model()
NAMES: dict[int, str] = MODEL.names if isinstance(MODEL.names, dict) else {i: n for i, n in enumerate(MODEL.names)}


def norm_label(raw: str) -> str:
    key = raw.strip().lower().replace(" ", "-")
    if key in PPE:
        return key
    return ALIAS.get(key, key)


class InspectIn(BaseModel):
    image: str
    required: list[str] = []


class StreamIn(BaseModel):
    camera_id: str
    rtsp: str
    required: list[str] = ["helmet"]
    interval: float = 4.0


app = FastAPI(title="AEGIS PPE detector", version="2.0")
_origins = [x.strip() for x in os.environ.get("AEGIS_CORS", "").split(",") if x.strip()] or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["POST", "GET"],
    allow_headers=["Authorization", "Content-Type"],
)

STREAMS: dict[str, dict[str, Any]] = {}
INGEST_URL = os.environ.get("AEGIS_INGEST_URL", "")
INGEST_TOKEN = os.environ.get("AEGIS_INGEST_TOKEN", "")


def decode_image(data: str) -> np.ndarray:
    raw = data.split(",", 1)[-1]
    buf = base64.b64decode(raw)
    img = Image.open(io.BytesIO(buf)).convert("RGB")
    return np.array(img)


def inspect_array(arr: np.ndarray, required: list[str]) -> dict[str, Any]:
    need = [x for x in required if x in PPE]
    h, w = arr.shape[:2]
    result = MODEL.predict(arr, verbose=False, conf=0.35)[0]
    people: list[dict[str, Any]] = []
    boxes = result.boxes
    if boxes is None:
        return empty_ok()

    person_boxes: list[tuple[list[float], float]] = []
    gear: list[tuple[str, list[float], bool]] = []

    for box in boxes:
        cls_id = int(box.cls[0])
        label = norm_label(str(NAMES.get(cls_id, "")))
        xyxy = box.xyxy[0].tolist()
        conf = float(box.conf[0])
        nx = [xyxy[0] / w, xyxy[1] / h, max(0.02, (xyxy[2] - xyxy[0]) / w), max(0.02, (xyxy[3] - xyxy[1]) / h)]
        raw_name = str(NAMES.get(cls_id, "")).lower()
        absent = raw_name.startswith("no-") or raw_name.startswith("no_")
        if label in {"person", "people", "worker"}:
            person_boxes.append((nx, conf))
        elif label in PPE:
            gear.append((label, nx, absent))

    if not person_boxes:
        for i, (label, nx, absent) in enumerate(gear):
            present = [] if absent else [label]
            missing = [x for x in need if x not in present]
            people.append(person_payload(f"P{i + 1}", nx, present, missing, 0.7))
    else:
        for i, (pb, conf) in enumerate(person_boxes):
            present: list[str] = []
            missing_force: list[str] = []
            for label, gx, absent in gear:
                if overlap(pb, gx) < 0.15:
                    continue
                if absent:
                    missing_force.append(label)
                elif label not in present:
                    present.append(label)
            missing = [x for x in need if x not in present]
            for m in missing_force:
                if m not in missing:
                    missing.append(m)
            people.append(person_payload(f"P{i + 1}", pb, present, missing, conf))

    viol = sum(1 for p in people if not p["compliant"])
    risk = "low"
    if viol and any("harness" in p["missing"] for p in people):
        risk = "critical"
    elif viol / max(1, len(people)) >= 0.5:
        risk = "high"
    elif viol:
        risk = "medium"
    return {
        "persons": people,
        "scene": "YOLO RTSP detector",
        "risk": risk,
        "summary": f"{viol} of {len(people)} workers missing checked PPE." if people else "No workers detected.",
        "summaryAr": f"{viol} من {len(people)} عمال ينقصهم معدات هذا الفحص." if people else "لا يوجد عمال في الإطار.",
    }


def person_payload(pid: str, bbox: list[float], present: list[str], missing: list[str], conf: float) -> dict[str, Any]:
    return {
        "id": pid,
        "bbox": {"x": bbox[0], "y": bbox[1], "w": bbox[2], "h": bbox[3]},
        "present": present,
        "missing": missing,
        "confidence": conf,
        "compliant": len(missing) == 0,
    }


def overlap(a: list[float], b: list[float]) -> float:
    ax2, ay2 = a[0] + a[2], a[1] + a[3]
    bx2, by2 = b[0] + b[2], b[1] + b[3]
    ix = max(0.0, min(ax2, bx2) - max(a[0], b[0]))
    iy = max(0.0, min(ay2, by2) - max(a[1], b[1]))
    inter = ix * iy
    union = a[2] * a[3] + b[2] * b[3] - inter
    return inter / union if union else 0.0


def empty_ok() -> dict[str, Any]:
    return {
        "persons": [],
        "scene": "YOLO RTSP detector",
        "risk": "low",
        "summary": "No workers detected.",
        "summaryAr": "لا يوجد عمال في الإطار.",
    }


def post_ingest(camera_id: str, result: dict[str, Any]) -> None:
    if not INGEST_URL or not INGEST_TOKEN:
        return
    payload = json_dumps({"cameraId": camera_id, "result": result}).encode("utf-8")
    req = urllib.request.Request(
        INGEST_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {INGEST_TOKEN}",
        },
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=8).read()
    except Exception as exc:  # noqa: BLE001
        print("[ingest]", camera_id, exc)


def json_dumps(obj: Any) -> str:
    import json

    return json.dumps(obj)


def rtsp_loop(camera_id: str) -> None:
    os.environ.setdefault("OPENCV_FFMPEG_CAPTURE_OPTIONS", "rtsp_transport;tcp")
    while True:
        cfg = STREAMS.get(camera_id)
        if not cfg or not cfg.get("rtsp"):
            time.sleep(1)
            continue
        cap = cv2.VideoCapture(cfg["rtsp"], cv2.CAP_FFMPEG)
        if not cap.isOpened():
            print("[rtsp] cannot open", camera_id)
            time.sleep(5)
            continue
        interval = float(cfg.get("interval") or 4)
        last = 0.0
        while camera_id in STREAMS and STREAMS[camera_id].get("rtsp") == cfg["rtsp"]:
            ok, frame = cap.read()
            if not ok:
                break
            now = time.time()
            if now - last < interval:
                continue
            last = now
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = inspect_array(rgb, list(cfg.get("required") or ["helmet"]))
            STREAMS[camera_id]["last"] = result
            post_ingest(camera_id, result)
        cap.release()
        time.sleep(2)


def start_stream(camera_id: str, rtsp: str, required: list[str], interval: float) -> None:
    STREAMS[camera_id] = {"rtsp": rtsp, "required": required, "interval": interval, "last": None}
    thread = threading.Thread(target=rtsp_loop, args=(camera_id,), daemon=True, name=f"rtsp-{camera_id}")
    thread.start()


@app.post("/inspect")
def inspect(body: InspectIn) -> dict[str, Any]:
    arr = decode_image(body.image)
    return inspect_array(arr, body.required)


@app.post("/streams")
def add_stream(body: StreamIn) -> dict[str, Any]:
    start_stream(body.camera_id, body.rtsp, body.required, body.interval)
    return {"ok": True, "camera_id": body.camera_id}


@app.get("/streams/{camera_id}")
def stream_last(camera_id: str) -> dict[str, Any]:
    row = STREAMS.get(camera_id)
    if not row:
        return empty_ok()
    return row.get("last") or empty_ok()


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "model": os.path.basename(WEIGHTS if os.path.isfile(WEIGHTS) else FALLBACK),
        "streams": list(STREAMS.keys()),
        "ingest": bool(INGEST_URL),
    }


def parse_streams(raw: list[str] | None, env_blob: str) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    chunks = list(raw or [])
    if env_blob:
        chunks.extend([p for p in env_blob.split(";") if p.strip()])
    for item in chunks:
        if "|" not in item:
            continue
        cam, url = item.split("|", 1)
        cam, url = cam.strip(), url.strip()
        if cam and url:
            out.append((cam, url))
    return out


def main() -> None:
    global INGEST_URL, INGEST_TOKEN
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8090)
    parser.add_argument("--ingest", default=os.environ.get("AEGIS_INGEST_URL", ""))
    parser.add_argument("--token", default=os.environ.get("AEGIS_INGEST_TOKEN", ""))
    parser.add_argument("--stream", action="append", default=[])
    parser.add_argument("--interval", type=float, default=4.0)
    args = parser.parse_args()
    INGEST_URL = args.ingest
    INGEST_TOKEN = args.token
    for cam, url in parse_streams(args.stream, os.environ.get("AEGIS_STREAMS", "")):
        start_stream(cam, url, ["helmet", "vest"], args.interval)
    import uvicorn

    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
