import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  destForRole,
  isProductOwner,
  OWNER_EMAIL,
  OWNER_ID,
  resolveWorkspaceIdentity,
} from "./identity.ts";

describe("isProductOwner", () => {
  it("matches owner id and email", () => {
    assert.equal(isProductOwner(OWNER_ID), true);
    assert.equal(isProductOwner("x", OWNER_EMAIL), true);
    assert.equal(isProductOwner("x", "Mohamedmigo98@gmail.com"), true);
    assert.equal(isProductOwner("x", "mohamedmigo98@aegis.local"), true);
  });
  it("rejects plant users", () => {
    assert.equal(isProductOwner("usr_plant", "migo98@aegis.local"), false);
    assert.equal(isProductOwner("usr_plant", "buyer@factory.com"), false);
  });
});

describe("resolveWorkspaceIdentity", () => {
  it("plant token wins over grok owner request", () => {
    const r = resolveWorkspaceIdentity({
      requestUserId: "grok-mohamed",
      requestEmail: OWNER_EMAIL,
      tokenUserId: "usr_migo",
      tokenEmail: "migo98@aegis.local",
    });
    assert.equal(r.userId, "usr_migo");
    assert.equal(r.promoteOwner, false);
  });

  it("owner token promotes the live request user", () => {
    const r = resolveWorkspaceIdentity({
      requestUserId: "grok-mohamed",
      requestEmail: OWNER_EMAIL,
      tokenUserId: OWNER_ID,
      tokenEmail: OWNER_EMAIL,
    });
    assert.equal(r.userId, "grok-mohamed");
    assert.equal(r.promoteOwner, true);
  });

  it("no token + plant request stays plant", () => {
    const r = resolveWorkspaceIdentity({
      requestUserId: "usr_migo",
      requestEmail: "migo98@aegis.local",
    });
    assert.equal(r.userId, "usr_migo");
    assert.equal(r.promoteOwner, false);
  });

  it("no token + owner email promotes", () => {
    const r = resolveWorkspaceIdentity({
      requestUserId: "grok-mohamed",
      requestEmail: OWNER_EMAIL,
    });
    assert.equal(r.promoteOwner, true);
  });
});

describe("destForRole", () => {
  it("routes platform to console and plants to ops", () => {
    assert.equal(destForRole("platform"), "/platform");
    assert.equal(destForRole("owner"), "/");
    assert.equal(destForRole("admin"), "/");
    assert.equal(destForRole("member"), "/");
  });
});
