alter table organizations add column if not exists kind text not null default 'plant';
alter table memberships add column if not exists username text not null default '';
