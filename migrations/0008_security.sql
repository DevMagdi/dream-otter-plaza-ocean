create table if not exists login_attempts (
  identity text primary key,
  fails int not null default 0,
  blocked_until timestamptz
);

create table if not exists audit_events (
  id text primary key,
  at timestamptz not null default now(),
  actor_id text not null default '',
  action text not null,
  target text not null default '',
  detail text not null default ''
);
create index if not exists audit_events_at_idx on audit_events (at desc);

create table if not exists ingest_hits (
  org_id text not null,
  bucket text not null,
  n int not null default 0,
  primary key (org_id, bucket)
);
