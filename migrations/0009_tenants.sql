create table if not exists tenants (
  org_id text primary key references organizations(id) on delete cascade,
  db_name text not null unique,
  created_at timestamptz not null default now()
);
