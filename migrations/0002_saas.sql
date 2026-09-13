create table if not exists organizations (
  id text primary key,
  name text not null,
  name_ar text not null default '',
  plan text not null default 'trial',
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  org_id text not null references organizations(id) on delete cascade,
  user_id text not null,
  email text not null default '',
  display_name text not null default '',
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index if not exists memberships_user_id_idx on memberships (user_id);

create table if not exists org_settings (
  org_id text primary key references organizations(id) on delete cascade,
  manager_name text not null default '',
  manager_email text not null default '',
  hourly_enabled boolean not null default true,
  last_brief_at timestamptz
);

create table if not exists sites (
  org_id text not null references organizations(id) on delete cascade,
  id text not null,
  name text not null,
  name_ar text not null default '',
  industry text not null,
  city text not null default '',
  city_ar text not null default '',
  zones_json text not null default '[]',
  primary key (org_id, id)
);

create table if not exists cameras (
  org_id text not null references organizations(id) on delete cascade,
  id text not null,
  site_id text not null,
  zone_id text not null default '',
  name text not null,
  name_ar text not null default '',
  image text not null default '',
  kind text not null default 'sample',
  enabled boolean not null default true,
  checks_json text not null default '[]',
  cached_json text,
  primary key (org_id, id)
);

create table if not exists incidents (
  org_id text not null references organizations(id) on delete cascade,
  id text not null,
  at timestamptz not null default now(),
  site_id text not null,
  zone_id text not null default '',
  camera_id text not null,
  person_id text not null default '',
  missing_json text not null default '[]',
  present_json text not null default '[]',
  risk text not null default 'medium',
  summary text not null default '',
  summary_ar text not null default '',
  status text not null default 'open',
  primary key (org_id, id)
);
create index if not exists incidents_org_status_idx on incidents (org_id, status);

create table if not exists scans (
  org_id text not null references organizations(id) on delete cascade,
  id text not null,
  at timestamptz not null default now(),
  site_id text not null,
  zone_id text not null default '',
  camera_id text not null,
  source text not null default 'sample',
  persons int not null default 0,
  violations int not null default 0,
  risk text not null default 'low',
  compliance double precision not null default 1,
  primary key (org_id, id)
);

create table if not exists briefs (
  org_id text not null references organizations(id) on delete cascade,
  id text not null,
  from_ts timestamptz not null,
  to_ts timestamptz not null,
  created_at timestamptz not null default now(),
  status text not null default 'ready',
  payload_json text not null default '{}',
  primary key (org_id, id)
);

create table if not exists invites (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  email text not null default '',
  role text not null default 'member',
  code text not null unique,
  created_by text not null,
  created_at timestamptz not null default now()
);
create index if not exists invites_code_idx on invites (code);
