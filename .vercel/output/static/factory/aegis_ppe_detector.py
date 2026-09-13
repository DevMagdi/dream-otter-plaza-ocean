"""
AEGIS PPE detector — factory edge box
Open this folder in PyCharm. Run:

    pip install -r requirements.txt
    python aegis_ppe_detector.py

Then point cameras (webcam index 0, or an RTSP URL) at it.
POST /inspect with a JPEG to get the same JSON the AEGIS console uses.

This is YOLO (Ultralytics), not an LLM. It runs offline on a PC/GPU
next to the gate. Drop a PPE-trained weight at weights/ppe.pt
(classes: helmet, vest, goggles, gloves, boots, mask, facemask, ear, harness,
faceshield, coverall, labcoat, hairnet, person, no-helmet, no-vest).
Without that file it loads yolov8n and reports people only.
"""

from __future__ import annotations

import argparse
import base64
import io
import os
from typing import Any

import numpy as np
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


app = FastAPI(title="AEGIS PPE detector", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        # PPE-only models: treat each helmet/vest cluster as a person via the box
        for i, (label, nx, absent) in enumerate(gear):
            present = [] if absent else [label]
            missing = [x for x in need if x not in present]
            people.append(person_payload(f"P{i + 1}", nx, present, missing, 0.7))
    else:
        for i, (pb, conf) in enumerate(person_boxes):
            present: list[str] = []
            missing_force: list[str] = []
            px, py, pw, ph = pb
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
        "scene": "YOLO factory detector",
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
        "scene": "YOLO factory detector",
        "risk": "low",
        "summary": "No workers detected.",
        "summaryAr": "لا يوجد عمال في الإطار.",
    }


@app.post("/inspect")
def inspect(body: InspectIn) -> dict[str, Any]:
    arr = decode_image(body.image)
    return inspect_array(arr, body.required)


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "model": os.path.basename(WEIGHTS if os.path.isfile(WEIGHTS) else FALLBACK)}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8090)
    args = parser.parse_args()
    import uvicorn

    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
