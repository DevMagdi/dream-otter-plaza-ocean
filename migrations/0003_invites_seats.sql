alter table invites add column if not exists expires_at timestamptz;
alter table invites add column if not exists consumed_at timestamptz;
alter table invites add column if not exists consumed_by text;
