/*
  AEGIS PPE — Microsoft SQL Server (Express / Standard / Enterprise)
  شغّله مرة واحدة من SSMS وهو متصل بـ master.

  ينشئ:
    1) قاعدة المنصة  aegis_platform
    2) جداول المستخدمين والمنشآت
    3) إجراء إنشاء قاعدة لكل عميل:  EXEC dbo.usp_aegis_create_tenant N'org_xxxxx';
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

USE master;
GO

IF DB_ID(N'aegis_platform') IS NULL
BEGIN
  CREATE DATABASE aegis_platform
    COLLATE Arabic_CI_AS;
END
GO

USE aegis_platform;
GO

/* ========== جداول المنصة ========== */

IF OBJECT_ID(N'dbo._migrations', N'U') IS NULL
CREATE TABLE dbo._migrations (
  name nvarchar(200) NOT NULL PRIMARY KEY,
  applied_at datetime2 NOT NULL CONSTRAINT DF_mig_at DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID(N'dbo.[user]', N'U') IS NULL
CREATE TABLE dbo.[user] (
  id nvarchar(80) NOT NULL PRIMARY KEY,
  name nvarchar(200) NOT NULL,
  email nvarchar(200) NOT NULL,
  emailVerified bit NOT NULL CONSTRAINT DF_user_ev DEFAULT 1,
  createdAt datetime2 NOT NULL CONSTRAINT DF_user_c DEFAULT SYSUTCDATETIME(),
  updatedAt datetime2 NOT NULL CONSTRAINT DF_user_u DEFAULT SYSUTCDATETIME()
);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'user_email_uq' AND object_id = OBJECT_ID(N'dbo.[user]'))
CREATE UNIQUE INDEX user_email_uq ON dbo.[user](email);

IF OBJECT_ID(N'dbo.[account]', N'U') IS NULL
CREATE TABLE dbo.[account] (
  id nvarchar(80) NOT NULL PRIMARY KEY,
  accountId nvarchar(80) NOT NULL,
  providerId nvarchar(80) NOT NULL,
  userId nvarchar(80) NOT NULL,
  password nvarchar(max) NULL,
  createdAt datetime2 NOT NULL CONSTRAINT DF_acc_c DEFAULT SYSUTCDATETIME(),
  updatedAt datetime2 NOT NULL CONSTRAINT DF_acc_u DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID(N'dbo.[session]', N'U') IS NULL
CREATE TABLE dbo.[session] (
  id nvarchar(80) NOT NULL PRIMARY KEY,
  expiresAt datetime2 NOT NULL,
  token nvarchar(200) NOT NULL,
  createdAt datetime2 NOT NULL CONSTRAINT DF_ses_c DEFAULT SYSUTCDATETIME(),
  updatedAt datetime2 NOT NULL CONSTRAINT DF_ses_u DEFAULT SYSUTCDATETIME(),
  userId nvarchar(80) NOT NULL
);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'session_token_uq' AND object_id = OBJECT_ID(N'dbo.[session]'))
CREATE UNIQUE INDEX session_token_uq ON dbo.[session](token);

IF OBJECT_ID(N'dbo.organizations', N'U') IS NULL
CREATE TABLE dbo.organizations (
  id nvarchar(80) NOT NULL PRIMARY KEY,
  name nvarchar(200) NOT NULL,
  name_ar nvarchar(200) NOT NULL CONSTRAINT DF_org_ar DEFAULT N'',
  [plan] nvarchar(40) NOT NULL CONSTRAINT DF_org_plan DEFAULT N'trial',
  created_by nvarchar(80) NOT NULL,
  created_at datetime2 NOT NULL CONSTRAINT DF_org_c DEFAULT SYSUTCDATETIME(),
  kind nvarchar(20) NOT NULL CONSTRAINT DF_org_kind DEFAULT N'plant'
);

IF OBJECT_ID(N'dbo.memberships', N'U') IS NULL
CREATE TABLE dbo.memberships (
  org_id nvarchar(80) NOT NULL,
  user_id nvarchar(80) NOT NULL,
  email nvarchar(200) NOT NULL CONSTRAINT DF_mem_email DEFAULT N'',
  display_name nvarchar(200) NOT NULL CONSTRAINT DF_mem_dn DEFAULT N'',
  role nvarchar(20) NOT NULL CONSTRAINT DF_mem_role DEFAULT N'member',
  username nvarchar(80) NOT NULL CONSTRAINT DF_mem_un DEFAULT N'',
  locked bit NOT NULL CONSTRAINT DF_mem_lock DEFAULT 0,
  created_at datetime2 NOT NULL CONSTRAINT DF_mem_c DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_memberships PRIMARY KEY (org_id, user_id)
);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'memberships_user_id_idx' AND object_id = OBJECT_ID(N'dbo.memberships'))
CREATE INDEX memberships_user_id_idx ON dbo.memberships(user_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'memberships_username_uq' AND object_id = OBJECT_ID(N'dbo.memberships'))
CREATE UNIQUE INDEX memberships_username_uq ON dbo.memberships(username) WHERE username <> N'';

IF OBJECT_ID(N'dbo.tenants', N'U') IS NULL
CREATE TABLE dbo.tenants (
  org_id nvarchar(80) NOT NULL PRIMARY KEY,
  db_name nvarchar(64) NOT NULL UNIQUE,
  created_at datetime2 NOT NULL CONSTRAINT DF_ten_c DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID(N'dbo.login_attempts', N'U') IS NULL
CREATE TABLE dbo.login_attempts (
  [identity] nvarchar(200) NOT NULL PRIMARY KEY,
  fails int NOT NULL CONSTRAINT DF_la_fails DEFAULT 0,
  blocked_until datetime2 NULL,
  updated_at datetime2 NOT NULL CONSTRAINT DF_la_u DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID(N'dbo.audit_events', N'U') IS NULL
CREATE TABLE dbo.audit_events (
  id nvarchar(80) NOT NULL PRIMARY KEY,
  at datetime2 NOT NULL CONSTRAINT DF_aud_at DEFAULT SYSUTCDATETIME(),
  actor_id nvarchar(80) NOT NULL CONSTRAINT DF_aud_actor DEFAULT N'',
  action nvarchar(80) NOT NULL,
  target nvarchar(200) NOT NULL CONSTRAINT DF_aud_tgt DEFAULT N'',
  detail nvarchar(400) NOT NULL CONSTRAINT DF_aud_d DEFAULT N''
);

IF NOT EXISTS (SELECT 1 FROM dbo.organizations WHERE id = N'plt_aegis')
INSERT INTO dbo.organizations (id, name, name_ar, [plan], created_by, kind)
VALUES (N'plt_aegis', N'AEGIS', N'أيجيس', N'enterprise', N'usr_platform_mohamed', N'platform');

IF NOT EXISTS (SELECT 1 FROM dbo._migrations WHERE name = N'001_platform.sql')
INSERT INTO dbo._migrations (name) VALUES (N'001_platform.sql');
GO

/* ========== قالب جداول العميل (يتنفذ داخل قاعدة المصنع) ========== */

IF OBJECT_ID(N'dbo.usp_aegis_apply_tenant_schema', N'P') IS NOT NULL
  DROP PROCEDURE dbo.usp_aegis_apply_tenant_schema;
GO

CREATE PROCEDURE dbo.usp_aegis_apply_tenant_schema
AS
BEGIN
  SET NOCOUNT ON;

  IF OBJECT_ID(N'dbo._migrations', N'U') IS NULL
  CREATE TABLE dbo._migrations (
    name nvarchar(200) NOT NULL PRIMARY KEY,
    applied_at datetime2 NOT NULL CONSTRAINT DF_t_mig DEFAULT SYSUTCDATETIME()
  );

  IF OBJECT_ID(N'dbo.organizations', N'U') IS NULL
  CREATE TABLE dbo.organizations (
    id nvarchar(80) NOT NULL PRIMARY KEY,
    name nvarchar(200) NOT NULL,
    name_ar nvarchar(200) NOT NULL CONSTRAINT DF_t_org_ar DEFAULT N'',
    [plan] nvarchar(40) NOT NULL CONSTRAINT DF_t_org_plan DEFAULT N'trial',
    created_by nvarchar(80) NOT NULL,
    created_at datetime2 NOT NULL CONSTRAINT DF_t_org_c DEFAULT SYSUTCDATETIME(),
    kind nvarchar(20) NOT NULL CONSTRAINT DF_t_org_kind DEFAULT N'plant'
  );

  IF OBJECT_ID(N'dbo.org_settings', N'U') IS NULL
  CREATE TABLE dbo.org_settings (
    org_id nvarchar(80) NOT NULL PRIMARY KEY,
    manager_name nvarchar(200) NOT NULL CONSTRAINT DF_t_mgr DEFAULT N'',
    manager_email nvarchar(200) NOT NULL CONSTRAINT DF_t_em DEFAULT N'',
    hourly_enabled bit NOT NULL CONSTRAINT DF_t_hr DEFAULT 1,
    last_brief_at datetime2 NULL,
    detector_url nvarchar(400) NOT NULL CONSTRAINT DF_t_det DEFAULT N'http://127.0.0.1:8090',
    ingest_key_hash nvarchar(128) NOT NULL CONSTRAINT DF_t_ing DEFAULT N''
  );

  IF OBJECT_ID(N'dbo.sites', N'U') IS NULL
  CREATE TABLE dbo.sites (
    org_id nvarchar(80) NOT NULL,
    id nvarchar(80) NOT NULL,
    name nvarchar(200) NOT NULL,
    name_ar nvarchar(200) NOT NULL CONSTRAINT DF_t_site_ar DEFAULT N'',
    industry nvarchar(40) NOT NULL,
    city nvarchar(120) NOT NULL CONSTRAINT DF_t_city DEFAULT N'',
    city_ar nvarchar(120) NOT NULL CONSTRAINT DF_t_city_ar DEFAULT N'',
    zones_json nvarchar(max) NOT NULL CONSTRAINT DF_t_zones DEFAULT N'[]',
    CONSTRAINT PK_sites PRIMARY KEY (org_id, id)
  );

  IF OBJECT_ID(N'dbo.cameras', N'U') IS NULL
  CREATE TABLE dbo.cameras (
    org_id nvarchar(80) NOT NULL,
    id nvarchar(80) NOT NULL,
    site_id nvarchar(80) NOT NULL,
    zone_id nvarchar(80) NOT NULL CONSTRAINT DF_t_cam_z DEFAULT N'',
    name nvarchar(200) NOT NULL,
    name_ar nvarchar(200) NOT NULL CONSTRAINT DF_t_cam_ar DEFAULT N'',
    image nvarchar(max) NOT NULL CONSTRAINT DF_t_cam_img DEFAULT N'',
    kind nvarchar(20) NOT NULL CONSTRAINT DF_t_cam_k DEFAULT N'live',
    enabled bit NOT NULL CONSTRAINT DF_t_cam_en DEFAULT 1,
    checks_json nvarchar(max) NOT NULL CONSTRAINT DF_t_cam_ch DEFAULT N'[]',
    cached_json nvarchar(max) NULL,
    rtsp_url nvarchar(400) NOT NULL CONSTRAINT DF_t_cam_rtsp DEFAULT N'',
    CONSTRAINT PK_cameras PRIMARY KEY (org_id, id)
  );

  IF OBJECT_ID(N'dbo.incidents', N'U') IS NULL
  CREATE TABLE dbo.incidents (
    org_id nvarchar(80) NOT NULL,
    id nvarchar(80) NOT NULL,
    at datetime2 NOT NULL CONSTRAINT DF_t_inc_at DEFAULT SYSUTCDATETIME(),
    site_id nvarchar(80) NOT NULL,
    zone_id nvarchar(80) NOT NULL CONSTRAINT DF_t_inc_z DEFAULT N'',
    camera_id nvarchar(80) NOT NULL,
    person_id nvarchar(80) NOT NULL CONSTRAINT DF_t_inc_p DEFAULT N'',
    missing_json nvarchar(max) NOT NULL CONSTRAINT DF_t_inc_m DEFAULT N'[]',
    present_json nvarchar(max) NOT NULL CONSTRAINT DF_t_inc_pr DEFAULT N'[]',
    risk nvarchar(20) NOT NULL CONSTRAINT DF_t_inc_r DEFAULT N'medium',
    summary nvarchar(400) NOT NULL CONSTRAINT DF_t_inc_s DEFAULT N'',
    summary_ar nvarchar(400) NOT NULL CONSTRAINT DF_t_inc_sa DEFAULT N'',
    status nvarchar(20) NOT NULL CONSTRAINT DF_t_inc_st DEFAULT N'open',
    CONSTRAINT PK_incidents PRIMARY KEY (org_id, id)
  );
  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'incidents_org_status_idx' AND object_id = OBJECT_ID(N'dbo.incidents'))
  CREATE INDEX incidents_org_status_idx ON dbo.incidents(org_id, status);

  IF OBJECT_ID(N'dbo.scans', N'U') IS NULL
  CREATE TABLE dbo.scans (
    org_id nvarchar(80) NOT NULL,
    id nvarchar(80) NOT NULL,
    at datetime2 NOT NULL CONSTRAINT DF_t_sc_at DEFAULT SYSUTCDATETIME(),
    site_id nvarchar(80) NOT NULL,
    zone_id nvarchar(80) NOT NULL CONSTRAINT DF_t_sc_z DEFAULT N'',
    camera_id nvarchar(80) NOT NULL,
    source nvarchar(20) NOT NULL CONSTRAINT DF_t_sc_src DEFAULT N'sample',
    persons int NOT NULL CONSTRAINT DF_t_sc_p DEFAULT 0,
    violations int NOT NULL CONSTRAINT DF_t_sc_v DEFAULT 0,
    risk nvarchar(20) NOT NULL CONSTRAINT DF_t_sc_r DEFAULT N'low',
    compliance float NOT NULL CONSTRAINT DF_t_sc_c DEFAULT 1,
    CONSTRAINT PK_scans PRIMARY KEY (org_id, id)
  );

  IF OBJECT_ID(N'dbo.briefs', N'U') IS NULL
  CREATE TABLE dbo.briefs (
    org_id nvarchar(80) NOT NULL,
    id nvarchar(80) NOT NULL,
    from_ts datetime2 NOT NULL,
    to_ts datetime2 NOT NULL,
    created_at datetime2 NOT NULL CONSTRAINT DF_t_br_c DEFAULT SYSUTCDATETIME(),
    status nvarchar(20) NOT NULL CONSTRAINT DF_t_br_s DEFAULT N'ready',
    payload_json nvarchar(max) NOT NULL CONSTRAINT DF_t_br_p DEFAULT N'{}',
    CONSTRAINT PK_briefs PRIMARY KEY (org_id, id)
  );

  IF NOT EXISTS (SELECT 1 FROM dbo._migrations WHERE name = N'001_tenant.sql')
  INSERT INTO dbo._migrations (name) VALUES (N'001_tenant.sql');
END
GO

/* إنشاء قاعدة مصنع جديدة يدوياً إن احتجت */
IF OBJECT_ID(N'dbo.usp_aegis_create_tenant', N'P') IS NOT NULL
  DROP PROCEDURE dbo.usp_aegis_create_tenant;
GO

CREATE PROCEDURE dbo.usp_aegis_create_tenant
  @org_id nvarchar(80)
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @db sysname = N'aegis_' + REPLACE(REPLACE(@org_id, N'-', N'_'), N'.', N'_');
  IF @db NOT LIKE N'aegis_[A-Za-z0-9_]%'
  BEGIN
    RAISERROR(N'Invalid tenant database name', 16, 1);
    RETURN;
  END

  DECLARE @sql nvarchar(max);
  IF DB_ID(@db) IS NULL
  BEGIN
    SET @sql = N'CREATE DATABASE ' + QUOTENAME(@db) + N' COLLATE Arabic_CI_AS;';
    EXEC (@sql);
  END

  SET @sql = N'USE ' + QUOTENAME(@db) + N'; EXEC aegis_platform.dbo.usp_aegis_apply_tenant_schema;';
  -- الإجراءات معرفة في aegis_platform فقط — نعيد بناء الجداول داخل قاعدة العميل مباشرة:
  SET @sql = N'
    USE ' + QUOTENAME(@db) + N';
    IF OBJECT_ID(N''dbo._migrations'', N''U'') IS NULL
    CREATE TABLE dbo._migrations (name nvarchar(200) NOT NULL PRIMARY KEY, applied_at datetime2 NOT NULL DEFAULT SYSUTCDATETIME());
    IF OBJECT_ID(N''dbo.organizations'', N''U'') IS NULL
    CREATE TABLE dbo.organizations (
      id nvarchar(80) NOT NULL PRIMARY KEY,
      name nvarchar(200) NOT NULL,
      name_ar nvarchar(200) NOT NULL DEFAULT N'''',
      [plan] nvarchar(40) NOT NULL DEFAULT N''trial'',
      created_by nvarchar(80) NOT NULL,
      created_at datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
      kind nvarchar(20) NOT NULL DEFAULT N''plant''
    );
    IF OBJECT_ID(N''dbo.org_settings'', N''U'') IS NULL
    CREATE TABLE dbo.org_settings (
      org_id nvarchar(80) NOT NULL PRIMARY KEY,
      manager_name nvarchar(200) NOT NULL DEFAULT N'''',
      manager_email nvarchar(200) NOT NULL DEFAULT N'''',
      hourly_enabled bit NOT NULL DEFAULT 1,
      last_brief_at datetime2 NULL,
      detector_url nvarchar(400) NOT NULL DEFAULT N''http://127.0.0.1:8090'',
      ingest_key_hash nvarchar(128) NOT NULL DEFAULT N''''
    );
    IF OBJECT_ID(N''dbo.sites'', N''U'') IS NULL
    CREATE TABLE dbo.sites (
      org_id nvarchar(80) NOT NULL, id nvarchar(80) NOT NULL,
      name nvarchar(200) NOT NULL, name_ar nvarchar(200) NOT NULL DEFAULT N'''',
      industry nvarchar(40) NOT NULL, city nvarchar(120) NOT NULL DEFAULT N'''',
      city_ar nvarchar(120) NOT NULL DEFAULT N'''', zones_json nvarchar(max) NOT NULL DEFAULT N''[]'',
      PRIMARY KEY (org_id, id)
    );
    IF OBJECT_ID(N''dbo.cameras'', N''U'') IS NULL
    CREATE TABLE dbo.cameras (
      org_id nvarchar(80) NOT NULL, id nvarchar(80) NOT NULL,
      site_id nvarchar(80) NOT NULL, zone_id nvarchar(80) NOT NULL DEFAULT N'''',
      name nvarchar(200) NOT NULL, name_ar nvarchar(200) NOT NULL DEFAULT N'''',
      image nvarchar(max) NOT NULL DEFAULT N'''', kind nvarchar(20) NOT NULL DEFAULT N''live'',
      enabled bit NOT NULL DEFAULT 1, checks_json nvarchar(max) NOT NULL DEFAULT N''[]'',
      cached_json nvarchar(max) NULL, rtsp_url nvarchar(400) NOT NULL DEFAULT N'''',
      PRIMARY KEY (org_id, id)
    );
    IF OBJECT_ID(N''dbo.incidents'', N''U'') IS NULL
    CREATE TABLE dbo.incidents (
      org_id nvarchar(80) NOT NULL, id nvarchar(80) NOT NULL,
      at datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
      site_id nvarchar(80) NOT NULL, zone_id nvarchar(80) NOT NULL DEFAULT N'''',
      camera_id nvarchar(80) NOT NULL, person_id nvarchar(80) NOT NULL DEFAULT N'''',
      missing_json nvarchar(max) NOT NULL DEFAULT N''[]'', present_json nvarchar(max) NOT NULL DEFAULT N''[]'',
      risk nvarchar(20) NOT NULL DEFAULT N''medium'', summary nvarchar(400) NOT NULL DEFAULT N'''',
      summary_ar nvarchar(400) NOT NULL DEFAULT N'''', status nvarchar(20) NOT NULL DEFAULT N''open'',
      PRIMARY KEY (org_id, id)
    );
    IF OBJECT_ID(N''dbo.scans'', N''U'') IS NULL
    CREATE TABLE dbo.scans (
      org_id nvarchar(80) NOT NULL, id nvarchar(80) NOT NULL,
      at datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
      site_id nvarchar(80) NOT NULL, zone_id nvarchar(80) NOT NULL DEFAULT N'''',
      camera_id nvarchar(80) NOT NULL, source nvarchar(20) NOT NULL DEFAULT N''sample'',
      persons int NOT NULL DEFAULT 0, violations int NOT NULL DEFAULT 0,
      risk nvarchar(20) NOT NULL DEFAULT N''low'', compliance float NOT NULL DEFAULT 1,
      PRIMARY KEY (org_id, id)
    );
    IF OBJECT_ID(N''dbo.briefs'', N''U'') IS NULL
    CREATE TABLE dbo.briefs (
      org_id nvarchar(80) NOT NULL, id nvarchar(80) NOT NULL,
      from_ts datetime2 NOT NULL, to_ts datetime2 NOT NULL,
      created_at datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
      status nvarchar(20) NOT NULL DEFAULT N''ready'', payload_json nvarchar(max) NOT NULL DEFAULT N''{}'',
      PRIMARY KEY (org_id, id)
    );
  ';
  EXEC (@sql);

  IF NOT EXISTS (SELECT 1 FROM dbo.tenants WHERE org_id = @org_id)
    INSERT INTO dbo.tenants (org_id, db_name) VALUES (@org_id, @db);
END
GO

PRINT N'AEGIS platform ready: aegis_platform';
PRINT N'To add a plant DB later:  EXEC dbo.usp_aegis_create_tenant N''org_yourid'';';
GO
