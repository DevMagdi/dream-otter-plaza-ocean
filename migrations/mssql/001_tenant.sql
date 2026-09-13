IF OBJECT_ID(N'_migrations', N'U') IS NULL
CREATE TABLE _migrations (
  name nvarchar(200) not null primary key,
  applied_at datetime2 not null default sysutcdatetime()
);

IF OBJECT_ID(N'organizations', N'U') IS NULL
CREATE TABLE organizations (
  id nvarchar(80) not null primary key,
  name nvarchar(200) not null,
  name_ar nvarchar(200) not null default N'',
  [plan] nvarchar(40) not null default N'trial',
  created_by nvarchar(80) not null,
  created_at datetime2 not null default sysutcdatetime(),
  kind nvarchar(20) not null default N'plant'
);

IF OBJECT_ID(N'org_settings', N'U') IS NULL
CREATE TABLE org_settings (
  org_id nvarchar(80) not null primary key,
  manager_name nvarchar(200) not null default N'',
  manager_email nvarchar(200) not null default N'',
  hourly_enabled bit not null default 1,
  last_brief_at datetime2 null,
  detector_url nvarchar(400) not null default N'http://127.0.0.1:8090',
  ingest_key_hash nvarchar(128) not null default N''
);

IF OBJECT_ID(N'sites', N'U') IS NULL
CREATE TABLE sites (
  org_id nvarchar(80) not null,
  id nvarchar(80) not null,
  name nvarchar(200) not null,
  name_ar nvarchar(200) not null default N'',
  industry nvarchar(40) not null,
  city nvarchar(120) not null default N'',
  city_ar nvarchar(120) not null default N'',
  zones_json nvarchar(max) not null default N'[]',
  primary key (org_id, id)
);

IF OBJECT_ID(N'cameras', N'U') IS NULL
CREATE TABLE cameras (
  org_id nvarchar(80) not null,
  id nvarchar(80) not null,
  site_id nvarchar(80) not null,
  zone_id nvarchar(80) not null default N'',
  name nvarchar(200) not null,
  name_ar nvarchar(200) not null default N'',
  image nvarchar(max) not null default N'',
  kind nvarchar(20) not null default N'live',
  enabled bit not null default 1,
  checks_json nvarchar(max) not null default N'[]',
  cached_json nvarchar(max) null,
  rtsp_url nvarchar(400) not null default N'',
  primary key (org_id, id)
);

IF OBJECT_ID(N'incidents', N'U') IS NULL
CREATE TABLE incidents (
  org_id nvarchar(80) not null,
  id nvarchar(80) not null,
  at datetime2 not null default sysutcdatetime(),
  site_id nvarchar(80) not null,
  zone_id nvarchar(80) not null default N'',
  camera_id nvarchar(80) not null,
  person_id nvarchar(80) not null default N'',
  missing_json nvarchar(max) not null default N'[]',
  present_json nvarchar(max) not null default N'[]',
  risk nvarchar(20) not null default N'medium',
  summary nvarchar(400) not null default N'',
  summary_ar nvarchar(400) not null default N'',
  status nvarchar(20) not null default N'open',
  primary key (org_id, id)
);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'incidents_org_status_idx' AND object_id = OBJECT_ID(N'incidents'))
CREATE INDEX incidents_org_status_idx ON incidents(org_id, status);

IF OBJECT_ID(N'scans', N'U') IS NULL
CREATE TABLE scans (
  org_id nvarchar(80) not null,
  id nvarchar(80) not null,
  at datetime2 not null default sysutcdatetime(),
  site_id nvarchar(80) not null,
  zone_id nvarchar(80) not null default N'',
  camera_id nvarchar(80) not null,
  source nvarchar(20) not null default N'sample',
  persons int not null default 0,
  violations int not null default 0,
  risk nvarchar(20) not null default N'low',
  compliance float not null default 1,
  primary key (org_id, id)
);

IF OBJECT_ID(N'briefs', N'U') IS NULL
CREATE TABLE briefs (
  org_id nvarchar(80) not null,
  id nvarchar(80) not null,
  from_ts datetime2 not null,
  to_ts datetime2 not null,
  created_at datetime2 not null default sysutcdatetime(),
  status nvarchar(20) not null default N'ready',
  payload_json nvarchar(max) not null default N'{}',
  primary key (org_id, id)
);
