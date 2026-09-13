IF OBJECT_ID(N'_migrations', N'U') IS NULL
CREATE TABLE _migrations (
  name nvarchar(200) not null primary key,
  applied_at datetime2 not null default sysutcdatetime()
);

IF OBJECT_ID(N'[user]', N'U') IS NULL
CREATE TABLE [user] (
  id nvarchar(80) not null primary key,
  name nvarchar(200) not null,
  email nvarchar(200) not null,
  emailVerified bit not null default 1,
  createdAt datetime2 not null default sysutcdatetime(),
  updatedAt datetime2 not null default sysutcdatetime()
);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'user_email_uq' AND object_id = OBJECT_ID(N'[user]'))
CREATE UNIQUE INDEX user_email_uq ON [user](email);

IF OBJECT_ID(N'[account]', N'U') IS NULL
CREATE TABLE [account] (
  id nvarchar(80) not null primary key,
  accountId nvarchar(80) not null,
  providerId nvarchar(80) not null,
  userId nvarchar(80) not null,
  password nvarchar(max) null,
  createdAt datetime2 not null default sysutcdatetime(),
  updatedAt datetime2 not null default sysutcdatetime()
);

IF OBJECT_ID(N'[session]', N'U') IS NULL
CREATE TABLE [session] (
  id nvarchar(80) not null primary key,
  expiresAt datetime2 not null,
  token nvarchar(200) not null,
  createdAt datetime2 not null default sysutcdatetime(),
  updatedAt datetime2 not null default sysutcdatetime(),
  userId nvarchar(80) not null
);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'session_token_uq' AND object_id = OBJECT_ID(N'[session]'))
CREATE UNIQUE INDEX session_token_uq ON [session](token);

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

IF OBJECT_ID(N'memberships', N'U') IS NULL
CREATE TABLE memberships (
  org_id nvarchar(80) not null,
  user_id nvarchar(80) not null,
  email nvarchar(200) not null default N'',
  display_name nvarchar(200) not null default N'',
  role nvarchar(20) not null default N'member',
  username nvarchar(80) not null default N'',
  locked bit not null default 0,
  created_at datetime2 not null default sysutcdatetime(),
  primary key (org_id, user_id)
);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'memberships_user_id_idx' AND object_id = OBJECT_ID(N'memberships'))
CREATE INDEX memberships_user_id_idx ON memberships(user_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'memberships_username_uq' AND object_id = OBJECT_ID(N'memberships'))
CREATE UNIQUE INDEX memberships_username_uq ON memberships(username) WHERE username <> N'';

IF OBJECT_ID(N'tenants', N'U') IS NULL
CREATE TABLE tenants (
  org_id nvarchar(80) not null primary key,
  db_name nvarchar(64) not null unique,
  created_at datetime2 not null default sysutcdatetime()
);

IF OBJECT_ID(N'login_attempts', N'U') IS NULL
CREATE TABLE login_attempts (
  [identity] nvarchar(200) not null primary key,
  fails int not null default 0,
  blocked_until datetime2 null,
  updated_at datetime2 not null default sysutcdatetime()
);

IF OBJECT_ID(N'audit_events', N'U') IS NULL
CREATE TABLE audit_events (
  id nvarchar(80) not null primary key,
  at datetime2 not null default sysutcdatetime(),
  actor_id nvarchar(80) not null default N'',
  action nvarchar(80) not null,
  target nvarchar(200) not null default N'',
  detail nvarchar(400) not null default N''
);
