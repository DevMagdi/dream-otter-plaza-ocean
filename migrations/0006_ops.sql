alter table organizations add column if not exists stripe_customer_id text;
alter table organizations add column if not exists stripe_subscription_id text;
alter table organizations add column if not exists stripe_status text not null default '';

alter table org_settings add column if not exists detector_url text not null default '';
alter table org_settings add column if not exists ingest_key_hash text not null default '';

alter table cameras add column if not exists rtsp_url text not null default '';
