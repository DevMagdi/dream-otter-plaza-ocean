import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pgToMssql, tenantDbName } from "./sql-dialect.ts";

describe("tenantDbName", () => {
  it("builds a legal SQL Server database name", () => {
    assert.equal(tenantDbName("org_ab12cd"), "aegis_org_ab12cd");
    assert.match(tenantDbName("org_x-y"), /^aegis_org_x_y$/);
    assert.ok(tenantDbName("org_" + "a".repeat(80)).length <= 64);
  });
});

describe("pgToMssql", () => {
  it("rewrites placeholders, quotes, limit and count", () => {
    const out = pgToMssql('select id from "user" where email = $1 limit 1');
    assert.equal(out, "select top 1 id from [user] where email = @p1");
  });

  it("casts count(*) and keeps filters", () => {
    const out = pgToMssql("select count(*)::int as n from memberships where org_id = $1");
    assert.equal(out, "select cast(count(*) as int) as n from memberships where org_id = @p1");
  });

  it("quotes SQL Server reserved column names", () => {
    const out = pgToMssql("select plan, kind from organizations where id = $1");
    assert.equal(out, "select [plan], kind from organizations where id = @p1");
    const login = pgToMssql("select fails from login_attempts where identity = $1 limit 1");
    assert.equal(login, "select top 1 fails from login_attempts where [identity] = @p1");
  });

  it("maps session lookup", () => {
    const out = pgToMssql(
      'select "userId" from "session" where token = $1 and "expiresAt" > $2 limit 1',
    );
    assert.equal(
      out,
      "select top 1 [userId] from [session] where token = @p1 and [expiresAt] > @p2",
    );
  });
});
