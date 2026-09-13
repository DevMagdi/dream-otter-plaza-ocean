import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyChecks } from "./checks.ts";
import { CAMERAS } from "./demo.ts";
import type { PpeId } from "./types.ts";

function failClosedResult(required: PpeId[]) {
  return {
    persons: [
      {
        id: "P1",
        bbox: { x: 0.18, y: 0.08, w: 0.64, h: 0.85 },
        present: [] as PpeId[],
        missing: [...required],
        confidence: 0.35,
        compliant: required.length === 0,
      },
    ],
  };
}

function offlineSampleResult(cameraId: string | undefined, required: PpeId[]) {
  if (!cameraId) return null;
  const cam = CAMERAS.find((c) => c.id === cameraId);
  if (!cam?.cached) return null;
  return applyChecks(cam.cached, required);
}

describe("offline sample PPE analysis", () => {
  it("returns cached detections for sample cameras", () => {
    const gate = offlineSampleResult("cam-gate", ["helmet", "vest"]);
    assert.ok(gate);
    assert.ok(gate.persons.length >= 1);
    assert.equal(typeof gate.summaryAr, "string");
  });

  it("returns null for unknown cameras", () => {
    assert.equal(offlineSampleResult("cam-unknown", ["helmet"]), null);
    assert.equal(offlineSampleResult(undefined, ["helmet"]), null);
  });

  it("applies required checks onto the cached sample", () => {
    const ward = offlineSampleResult("cam-ward", ["labcoat", "facemask"]);
    assert.ok(ward);
    for (const person of ward.persons) {
      for (const need of ["labcoat", "facemask"] as const) {
        assert.ok(person.present.includes(need) || person.missing.includes(need));
      }
    }
  });

  it("never returns empty for a live frame without a detector", () => {
    const closed = failClosedResult(["helmet", "vest"]);
    assert.equal(closed.persons.length, 1);
    assert.deepEqual(closed.persons[0].missing, ["helmet", "vest"]);
    assert.equal(closed.persons[0].compliant, false);
  });
});
