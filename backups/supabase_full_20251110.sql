--
-- PostgreSQL database dump
--

\restrict vJawWgpP50mYE2f79leZxDk3UAmuiLcoLuYqmoEYjiapf1JJOyvSbTSqUTMBxiT

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP EVENT TRIGGER pgrst_drop_watch;
DROP EVENT TRIGGER pgrst_ddl_watch;
DROP EVENT TRIGGER issue_pg_net_access;
DROP EVENT TRIGGER issue_pg_graphql_access;
DROP EVENT TRIGGER issue_pg_cron_access;
DROP EVENT TRIGGER issue_graphql_placeholder;
DROP PUBLICATION supabase_realtime;
ALTER TABLE ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE ONLY storage.s3_multipart_uploads DROP CONSTRAINT s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE ONLY storage.prefixes DROP CONSTRAINT "prefixes_bucketId_fkey";
ALTER TABLE ONLY storage.objects DROP CONSTRAINT "objects_bucketId_fkey";
ALTER TABLE ONLY public.user_sessions DROP CONSTRAINT user_sessions_user_id_fkey;
ALTER TABLE ONLY public.user_profiles DROP CONSTRAINT user_profiles_id_fkey;
ALTER TABLE ONLY public.threads DROP CONSTRAINT threads_user_id_fkey;
ALTER TABLE ONLY public.system_settings DROP CONSTRAINT system_settings_user_id_fkey;
ALTER TABLE ONLY public.summary_evaluations DROP CONSTRAINT summary_evaluations_user_id_fkey;
ALTER TABLE ONLY public.summary_evaluations DROP CONSTRAINT summary_evaluations_summary_id_fkey;
ALTER TABLE ONLY public.email_recipients DROP CONSTRAINT email_recipients_user_id_fkey;
ALTER TABLE ONLY public.daily_summaries DROP CONSTRAINT daily_summaries_thread_id_fkey;
ALTER TABLE ONLY public.article_summaries DROP CONSTRAINT article_summaries_user_id_fkey;
ALTER TABLE ONLY public.article_summaries DROP CONSTRAINT article_summaries_thread_id_fkey;
ALTER TABLE ONLY public.article_summaries DROP CONSTRAINT article_summaries_article_id_fkey;
ALTER TABLE ONLY auth.sso_domains DROP CONSTRAINT sso_domains_sso_provider_id_fkey;
ALTER TABLE ONLY auth.sessions DROP CONSTRAINT sessions_user_id_fkey;
ALTER TABLE ONLY auth.sessions DROP CONSTRAINT sessions_oauth_client_id_fkey;
ALTER TABLE ONLY auth.saml_relay_states DROP CONSTRAINT saml_relay_states_sso_provider_id_fkey;
ALTER TABLE ONLY auth.saml_relay_states DROP CONSTRAINT saml_relay_states_flow_state_id_fkey;
ALTER TABLE ONLY auth.saml_providers DROP CONSTRAINT saml_providers_sso_provider_id_fkey;
ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_session_id_fkey;
ALTER TABLE ONLY auth.one_time_tokens DROP CONSTRAINT one_time_tokens_user_id_fkey;
ALTER TABLE ONLY auth.oauth_consents DROP CONSTRAINT oauth_consents_user_id_fkey;
ALTER TABLE ONLY auth.oauth_consents DROP CONSTRAINT oauth_consents_client_id_fkey;
ALTER TABLE ONLY auth.oauth_authorizations DROP CONSTRAINT oauth_authorizations_user_id_fkey;
ALTER TABLE ONLY auth.oauth_authorizations DROP CONSTRAINT oauth_authorizations_client_id_fkey;
ALTER TABLE ONLY auth.mfa_factors DROP CONSTRAINT mfa_factors_user_id_fkey;
ALTER TABLE ONLY auth.mfa_challenges DROP CONSTRAINT mfa_challenges_auth_factor_id_fkey;
ALTER TABLE ONLY auth.mfa_amr_claims DROP CONSTRAINT mfa_amr_claims_session_id_fkey;
ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_user_id_fkey;
DROP TRIGGER update_objects_updated_at ON storage.objects;
DROP TRIGGER prefixes_delete_hierarchy ON storage.prefixes;
DROP TRIGGER prefixes_create_hierarchy ON storage.prefixes;
DROP TRIGGER objects_update_create_prefix ON storage.objects;
DROP TRIGGER objects_insert_create_prefix ON storage.objects;
DROP TRIGGER objects_delete_delete_prefix ON storage.objects;
DROP TRIGGER enforce_bucket_name_length_trigger ON storage.buckets;
DROP TRIGGER tr_check_filters ON realtime.subscription;
DROP TRIGGER update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER on_auth_user_created ON auth.users;
DROP INDEX storage.objects_bucket_id_level_idx;
DROP INDEX storage.name_prefix_search;
DROP INDEX storage.idx_prefixes_lower_name;
DROP INDEX storage.idx_objects_lower_name;
DROP INDEX storage.idx_objects_bucket_id_name;
DROP INDEX storage.idx_name_bucket_level_unique;
DROP INDEX storage.idx_multipart_uploads_list;
DROP INDEX storage.bucketid_objname;
DROP INDEX storage.bname;
DROP INDEX realtime.subscription_subscription_id_entity_filters_key;
DROP INDEX realtime.messages_inserted_at_topic_index;
DROP INDEX realtime.ix_realtime_subscription_entity;
DROP INDEX public.idx_user_sessions_user_id;
DROP INDEX public.idx_user_sessions_token;
DROP INDEX public.idx_user_sessions_expires;
DROP INDEX public.idx_user_sessions_active;
DROP INDEX public.idx_user_profiles_role;
DROP INDEX public.idx_user_profiles_email;
DROP INDEX public.idx_threads_user_id;
DROP INDEX public.idx_threads_user_date;
DROP INDEX public.idx_threads_status;
DROP INDEX public.idx_threads_started_at;
DROP INDEX public.idx_threads_run_date;
DROP INDEX public.idx_system_settings_user_id;
DROP INDEX public.idx_summary_evaluations_user_id;
DROP INDEX public.idx_summary_evaluations_summary;
DROP INDEX public.idx_summary_evaluations_grader;
DROP INDEX public.idx_summary_evaluations_created;
DROP INDEX public.idx_email_recipients_user_id;
DROP INDEX public.idx_daily_summaries_thread;
DROP INDEX public.idx_daily_summaries_langsmith;
DROP INDEX public.idx_daily_summaries_created;
DROP INDEX public.idx_article_summaries_user_id;
DROP INDEX public.idx_article_summaries_thread;
DROP INDEX public.idx_article_summaries_langsmith;
DROP INDEX public.idx_article_summaries_created;
DROP INDEX public.idx_article_summaries_article;
DROP INDEX auth.users_is_anonymous_idx;
DROP INDEX auth.users_instance_id_idx;
DROP INDEX auth.users_instance_id_email_idx;
DROP INDEX auth.users_email_partial_key;
DROP INDEX auth.user_id_created_at_idx;
DROP INDEX auth.unique_phone_factor_per_user;
DROP INDEX auth.sso_providers_resource_id_pattern_idx;
DROP INDEX auth.sso_providers_resource_id_idx;
DROP INDEX auth.sso_domains_sso_provider_id_idx;
DROP INDEX auth.sso_domains_domain_idx;
DROP INDEX auth.sessions_user_id_idx;
DROP INDEX auth.sessions_oauth_client_id_idx;
DROP INDEX auth.sessions_not_after_idx;
DROP INDEX auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX auth.saml_relay_states_for_email_idx;
DROP INDEX auth.saml_relay_states_created_at_idx;
DROP INDEX auth.saml_providers_sso_provider_id_idx;
DROP INDEX auth.refresh_tokens_updated_at_idx;
DROP INDEX auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX auth.refresh_tokens_parent_idx;
DROP INDEX auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX auth.refresh_tokens_instance_id_idx;
DROP INDEX auth.recovery_token_idx;
DROP INDEX auth.reauthentication_token_idx;
DROP INDEX auth.one_time_tokens_user_id_token_type_key;
DROP INDEX auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX auth.oauth_consents_user_order_idx;
DROP INDEX auth.oauth_consents_active_user_client_idx;
DROP INDEX auth.oauth_consents_active_client_idx;
DROP INDEX auth.oauth_clients_deleted_at_idx;
DROP INDEX auth.oauth_auth_pending_exp_idx;
DROP INDEX auth.mfa_factors_user_id_idx;
DROP INDEX auth.mfa_factors_user_friendly_name_unique;
DROP INDEX auth.mfa_challenge_created_at_idx;
DROP INDEX auth.idx_user_id_auth_method;
DROP INDEX auth.idx_auth_code;
DROP INDEX auth.identities_user_id_idx;
DROP INDEX auth.identities_email_idx;
DROP INDEX auth.flow_state_created_at_idx;
DROP INDEX auth.factor_id_created_at_idx;
DROP INDEX auth.email_change_token_new_idx;
DROP INDEX auth.email_change_token_current_idx;
DROP INDEX auth.confirmation_token_idx;
DROP INDEX auth.audit_logs_instance_id_idx;
ALTER TABLE ONLY supabase_migrations.seed_files DROP CONSTRAINT seed_files_pkey;
ALTER TABLE ONLY supabase_migrations.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
ALTER TABLE ONLY storage.s3_multipart_uploads DROP CONSTRAINT s3_multipart_uploads_pkey;
ALTER TABLE ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT s3_multipart_uploads_parts_pkey;
ALTER TABLE ONLY storage.prefixes DROP CONSTRAINT prefixes_pkey;
ALTER TABLE ONLY storage.objects DROP CONSTRAINT objects_pkey;
ALTER TABLE ONLY storage.migrations DROP CONSTRAINT migrations_pkey;
ALTER TABLE ONLY storage.migrations DROP CONSTRAINT migrations_name_key;
ALTER TABLE ONLY storage.buckets DROP CONSTRAINT buckets_pkey;
ALTER TABLE ONLY storage.buckets_analytics DROP CONSTRAINT buckets_analytics_pkey;
ALTER TABLE ONLY realtime.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
ALTER TABLE ONLY realtime.subscription DROP CONSTRAINT pk_subscription;
ALTER TABLE ONLY realtime.messages DROP CONSTRAINT messages_pkey;
ALTER TABLE ONLY public.user_sessions DROP CONSTRAINT user_sessions_token_key;
ALTER TABLE ONLY public.user_sessions DROP CONSTRAINT user_sessions_pkey;
ALTER TABLE ONLY public.user_profiles DROP CONSTRAINT user_profiles_pkey;
ALTER TABLE ONLY public.user_profiles DROP CONSTRAINT user_profiles_email_key;
ALTER TABLE ONLY public.threads DROP CONSTRAINT threads_user_run_date_key;
ALTER TABLE ONLY public.threads DROP CONSTRAINT threads_pkey;
ALTER TABLE ONLY public.system_settings DROP CONSTRAINT system_settings_unique;
ALTER TABLE ONLY public.system_settings DROP CONSTRAINT system_settings_pkey;
ALTER TABLE ONLY public.summary_evaluations DROP CONSTRAINT summary_evaluations_unique;
ALTER TABLE ONLY public.summary_evaluations DROP CONSTRAINT summary_evaluations_pkey;
ALTER TABLE ONLY public.search_settings DROP CONSTRAINT search_settings_pkey;
ALTER TABLE ONLY public.email_recipients DROP CONSTRAINT email_recipients_pkey;
ALTER TABLE ONLY public.daily_summaries DROP CONSTRAINT daily_summaries_thread_id_key;
ALTER TABLE ONLY public.daily_summaries DROP CONSTRAINT daily_summaries_pkey;
ALTER TABLE ONLY public.articles DROP CONSTRAINT articles_pkey;
ALTER TABLE ONLY public.article_summaries DROP CONSTRAINT article_summaries_unique;
ALTER TABLE ONLY public.article_summaries DROP CONSTRAINT article_summaries_pkey;
ALTER TABLE ONLY auth.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY auth.users DROP CONSTRAINT users_phone_key;
ALTER TABLE ONLY auth.sso_providers DROP CONSTRAINT sso_providers_pkey;
ALTER TABLE ONLY auth.sso_domains DROP CONSTRAINT sso_domains_pkey;
ALTER TABLE ONLY auth.sessions DROP CONSTRAINT sessions_pkey;
ALTER TABLE ONLY auth.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
ALTER TABLE ONLY auth.saml_relay_states DROP CONSTRAINT saml_relay_states_pkey;
ALTER TABLE ONLY auth.saml_providers DROP CONSTRAINT saml_providers_pkey;
ALTER TABLE ONLY auth.saml_providers DROP CONSTRAINT saml_providers_entity_id_key;
ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_token_unique;
ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_pkey;
ALTER TABLE ONLY auth.one_time_tokens DROP CONSTRAINT one_time_tokens_pkey;
ALTER TABLE ONLY auth.oauth_consents DROP CONSTRAINT oauth_consents_user_client_unique;
ALTER TABLE ONLY auth.oauth_consents DROP CONSTRAINT oauth_consents_pkey;
ALTER TABLE ONLY auth.oauth_clients DROP CONSTRAINT oauth_clients_pkey;
ALTER TABLE ONLY auth.oauth_authorizations DROP CONSTRAINT oauth_authorizations_pkey;
ALTER TABLE ONLY auth.oauth_authorizations DROP CONSTRAINT oauth_authorizations_authorization_id_key;
ALTER TABLE ONLY auth.oauth_authorizations DROP CONSTRAINT oauth_authorizations_authorization_code_key;
ALTER TABLE ONLY auth.mfa_factors DROP CONSTRAINT mfa_factors_pkey;
ALTER TABLE ONLY auth.mfa_factors DROP CONSTRAINT mfa_factors_last_challenged_at_key;
ALTER TABLE ONLY auth.mfa_challenges DROP CONSTRAINT mfa_challenges_pkey;
ALTER TABLE ONLY auth.mfa_amr_claims DROP CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE ONLY auth.instances DROP CONSTRAINT instances_pkey;
ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_provider_id_provider_unique;
ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_pkey;
ALTER TABLE ONLY auth.flow_state DROP CONSTRAINT flow_state_pkey;
ALTER TABLE ONLY auth.audit_log_entries DROP CONSTRAINT audit_log_entries_pkey;
ALTER TABLE ONLY auth.mfa_amr_claims DROP CONSTRAINT amr_id_pk;
ALTER TABLE public.system_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.search_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.email_recipients ALTER COLUMN id DROP DEFAULT;
ALTER TABLE auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE supabase_migrations.seed_files;
DROP TABLE supabase_migrations.schema_migrations;
DROP TABLE storage.s3_multipart_uploads_parts;
DROP TABLE storage.s3_multipart_uploads;
DROP TABLE storage.prefixes;
DROP TABLE storage.objects;
DROP TABLE storage.migrations;
DROP TABLE storage.buckets_analytics;
DROP TABLE storage.buckets;
DROP TABLE realtime.subscription;
DROP TABLE realtime.schema_migrations;
DROP TABLE realtime.messages;
DROP TABLE public.user_sessions;
DROP TABLE public.user_profiles;
DROP TABLE public.threads;
DROP SEQUENCE public.system_settings_id_seq;
DROP TABLE public.system_settings;
DROP TABLE public.summary_evaluations;
DROP SEQUENCE public.search_settings_id_seq;
DROP TABLE public.search_settings;
DROP SEQUENCE public.email_recipients_id_seq;
DROP TABLE public.email_recipients;
DROP TABLE public.daily_summaries;
DROP TABLE public.articles;
DROP TABLE public.article_summaries;
DROP TABLE auth.users;
DROP TABLE auth.sso_providers;
DROP TABLE auth.sso_domains;
DROP TABLE auth.sessions;
DROP TABLE auth.schema_migrations;
DROP TABLE auth.saml_relay_states;
DROP TABLE auth.saml_providers;
DROP SEQUENCE auth.refresh_tokens_id_seq;
DROP TABLE auth.refresh_tokens;
DROP TABLE auth.one_time_tokens;
DROP TABLE auth.oauth_consents;
DROP TABLE auth.oauth_clients;
DROP TABLE auth.oauth_authorizations;
DROP TABLE auth.mfa_factors;
DROP TABLE auth.mfa_challenges;
DROP TABLE auth.mfa_amr_claims;
DROP TABLE auth.instances;
DROP TABLE auth.identities;
DROP TABLE auth.flow_state;
DROP TABLE auth.audit_log_entries;
DROP FUNCTION storage.update_updated_at_column();
DROP FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text);
DROP FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION storage.prefixes_insert_trigger();
DROP FUNCTION storage.prefixes_delete_cleanup();
DROP FUNCTION storage.operation();
DROP FUNCTION storage.objects_update_prefix_trigger();
DROP FUNCTION storage.objects_update_level_trigger();
DROP FUNCTION storage.objects_update_cleanup();
DROP FUNCTION storage.objects_insert_prefix_trigger();
DROP FUNCTION storage.objects_delete_cleanup();
DROP FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]);
DROP FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text);
DROP FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION storage.get_size_by_bucket();
DROP FUNCTION storage.get_prefixes(name text);
DROP FUNCTION storage.get_prefix(name text);
DROP FUNCTION storage.get_level(name text);
DROP FUNCTION storage.foldername(name text);
DROP FUNCTION storage.filename(name text);
DROP FUNCTION storage.extension(name text);
DROP FUNCTION storage.enforce_bucket_name_length();
DROP FUNCTION storage.delete_prefix_hierarchy_trigger();
DROP FUNCTION storage.delete_prefix(_bucket_id text, _name text);
DROP FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]);
DROP FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION storage.add_prefixes(_bucket_id text, _name text);
DROP FUNCTION realtime.topic();
DROP FUNCTION realtime.to_regrole(role_name text);
DROP FUNCTION realtime.subscription_check_filters();
DROP FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean);
DROP FUNCTION realtime.quote_wal2json(entity regclass);
DROP FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
DROP FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
DROP FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
DROP FUNCTION realtime."cast"(val text, type_ regtype);
DROP FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
DROP FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
DROP FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer);
DROP FUNCTION public.update_updated_at_column();
DROP FUNCTION public.handle_new_user();
DROP FUNCTION pgbouncer.get_auth(p_usename text);
DROP FUNCTION extensions.set_graphql_placeholder();
DROP FUNCTION extensions.pgrst_drop_watch();
DROP FUNCTION extensions.pgrst_ddl_watch();
DROP FUNCTION extensions.grant_pg_net_access();
DROP FUNCTION extensions.grant_pg_graphql_access();
DROP FUNCTION extensions.grant_pg_cron_access();
DROP FUNCTION auth.uid();
DROP FUNCTION auth.role();
DROP FUNCTION auth.jwt();
DROP FUNCTION auth.email();
DROP TYPE storage.buckettype;
DROP TYPE realtime.wal_rls;
DROP TYPE realtime.wal_column;
DROP TYPE realtime.user_defined_filter;
DROP TYPE realtime.equality_op;
DROP TYPE realtime.action;
DROP TYPE auth.one_time_token_type;
DROP TYPE auth.oauth_response_type;
DROP TYPE auth.oauth_registration_type;
DROP TYPE auth.oauth_client_type;
DROP TYPE auth.oauth_authorization_status;
DROP TYPE auth.factor_type;
DROP TYPE auth.factor_status;
DROP TYPE auth.code_challenge_method;
DROP TYPE auth.aal_level;
DROP EXTENSION "uuid-ossp";
DROP EXTENSION supabase_vault;
DROP EXTENSION pgcrypto;
DROP EXTENSION pg_stat_statements;
DROP EXTENSION pg_graphql;
DROP SCHEMA vault;
DROP SCHEMA supabase_migrations;
DROP SCHEMA storage;
DROP SCHEMA realtime;
DROP SCHEMA pgbouncer;
DROP SCHEMA graphql_public;
DROP SCHEMA graphql;
DROP SCHEMA extensions;
DROP SCHEMA auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: article_summaries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article_summaries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    article_id text NOT NULL,
    thread_id uuid,
    summary text NOT NULL,
    model_used character varying(100) NOT NULL,
    langsmith_run_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


--
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.articles (
    id text NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    content text,
    published_date timestamp without time zone,
    source text,
    relevancy_score numeric(3,2),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: daily_summaries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_summaries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    thread_id uuid NOT NULL,
    collated_summary text NOT NULL,
    html_content text,
    collation_model character varying(100) NOT NULL,
    articles_summarized integer NOT NULL,
    langsmith_run_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_recipients (
    id integer NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    preferences jsonb DEFAULT '{"format": "html", "frequency": "daily"}'::jsonb,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: email_recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_recipients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_recipients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_recipients_id_seq OWNED BY public.email_recipients.id;


--
-- Name: search_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_settings (
    id integer NOT NULL,
    query text DEFAULT 'synthetic biology biotechnology'::text,
    max_results integer DEFAULT 10,
    sources jsonb DEFAULT '["nature.com", "science.org", "biorxiv.org"]'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    time_window integer DEFAULT 24
);


--
-- Name: search_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.search_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: search_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.search_settings_id_seq OWNED BY public.search_settings.id;


--
-- Name: summary_evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.summary_evaluations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    summary_id uuid NOT NULL,
    grader_email character varying(255) NOT NULL,
    grader_name character varying(255),
    simple_terminology numeric(3,2) NOT NULL,
    clear_concept numeric(3,2) NOT NULL,
    clear_methodology numeric(3,2) NOT NULL,
    balanced_details numeric(3,2) NOT NULL,
    feedback text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    CONSTRAINT summary_evaluations_balanced_details_check CHECK (((balanced_details >= (0)::numeric) AND (balanced_details <= (1)::numeric))),
    CONSTRAINT summary_evaluations_clear_concept_check CHECK (((clear_concept >= (0)::numeric) AND (clear_concept <= (1)::numeric))),
    CONSTRAINT summary_evaluations_clear_methodology_check CHECK (((clear_methodology >= (0)::numeric) AND (clear_methodology <= (1)::numeric))),
    CONSTRAINT summary_evaluations_simple_terminology_check CHECK (((simple_terminology >= (0)::numeric) AND (simple_terminology <= (1)::numeric)))
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    summary_length integer DEFAULT 100,
    target_audience text DEFAULT 'college sophomore'::text,
    include_citations boolean DEFAULT true,
    email_template text DEFAULT 'default'::text,
    llm_model text DEFAULT 'gpt-4o'::text,
    llm_temperature numeric(3,2) DEFAULT 0.3,
    llm_max_tokens integer DEFAULT 1000,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    relevancy_threshold numeric(3,2) DEFAULT 0.2,
    user_id uuid
);


--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    run_date date NOT NULL,
    status character varying(20) NOT NULL,
    articles_found integer DEFAULT 0,
    articles_processed integer DEFAULT 0,
    email_sent boolean DEFAULT false,
    langsmith_url text,
    langsmith_run_id uuid,
    error_message text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    metadata jsonb,
    user_id uuid,
    CONSTRAINT threads_status_check CHECK (((status)::text = ANY ((ARRAY['running'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255),
    role character varying(20) DEFAULT 'user'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_active_at timestamp with time zone,
    preferences jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT user_profiles_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    last_activity timestamp with time zone DEFAULT now(),
    ip_address inet,
    user_agent text,
    active boolean DEFAULT true
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: email_recipients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_recipients ALTER COLUMN id SET DEFAULT nextval('public.email_recipients_id_seq'::regclass);


--
-- Name: search_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_settings ALTER COLUMN id SET DEFAULT nextval('public.search_settings_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	c83c88fa-e8f3-4fae-9627-056adc71dc8d	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ashtekar@gmail.com","user_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da"}}	2025-11-04 18:53:42.591993+00	
00000000-0000-0000-0000-000000000000	b3fce7d3-e287-45f6-a76e-d425d091574d	{"action":"user_signedup","actor_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da","actor_username":"ashtekar@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-11-04 18:54:42.481859+00	
00000000-0000-0000-0000-000000000000	4a87905a-b682-4795-b145-e567578aaa4a	{"action":"user_recovery_requested","actor_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da","actor_username":"ashtekar@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-04 23:20:54.125762+00	
00000000-0000-0000-0000-000000000000	06e73a21-292e-4d86-810a-eac83a23e044	{"action":"login","actor_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da","actor_username":"ashtekar@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-04 23:21:13.440028+00	
00000000-0000-0000-0000-000000000000	835677ed-b824-4bc1-aec1-616f5478958e	{"action":"user_recovery_requested","actor_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da","actor_username":"ashtekar@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-04 23:47:42.631924+00	
00000000-0000-0000-0000-000000000000	6c7d45c1-58a6-4aa9-929d-ea0cbe996313	{"action":"user_recovery_requested","actor_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da","actor_username":"ashtekar@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-04 23:51:54.279199+00	
00000000-0000-0000-0000-000000000000	0822052a-5968-4e1e-a7ae-c973bf2be1b3	{"action":"login","actor_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da","actor_username":"ashtekar@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-04 23:52:14.480642+00	
00000000-0000-0000-0000-000000000000	d84fb96d-e2f2-4466-a9f6-110cd2a0841b	{"action":"user_recovery_requested","actor_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da","actor_username":"ashtekar@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-04 23:54:21.686405+00	
00000000-0000-0000-0000-000000000000	c0da9e6e-214c-4895-99f8-125286dca556	{"action":"login","actor_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da","actor_username":"ashtekar@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-04 23:54:48.00284+00	
00000000-0000-0000-0000-000000000000	543b0850-09f0-46f6-8a87-7eddf6c8e2d5	{"action":"user_recovery_requested","actor_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da","actor_username":"ashtekar@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-04 23:58:26.799557+00	
00000000-0000-0000-0000-000000000000	5a6e1434-c1c6-4b6b-bfc6-74fc94c743dd	{"action":"login","actor_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da","actor_username":"ashtekar@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-04 23:58:45.189099+00	
00000000-0000-0000-0000-000000000000	f68ea120-ae1d-4e2b-99cf-1537be67ed71	{"action":"user_confirmation_requested","actor_id":"06677f7f-23b3-4716-89a0-279c95af1813","actor_username":"ashtekar2010@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-11-06 02:22:42.499881+00	
00000000-0000-0000-0000-000000000000	096fa124-9486-4ce5-b7ab-6f9c793334d5	{"action":"user_signedup","actor_id":"06677f7f-23b3-4716-89a0-279c95af1813","actor_username":"ashtekar2010@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-11-06 02:23:04.847814+00	
00000000-0000-0000-0000-000000000000	c4d3c19e-5890-4887-8e16-90a3b9a38b9f	{"action":"user_recovery_requested","actor_id":"06677f7f-23b3-4716-89a0-279c95af1813","actor_username":"ashtekar2010@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-08 03:54:07.723685+00	
00000000-0000-0000-0000-000000000000	09e8c6a0-6b2e-4b78-b87a-6a1b324a551f	{"action":"login","actor_id":"06677f7f-23b3-4716-89a0-279c95af1813","actor_username":"ashtekar2010@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-08 03:54:25.457246+00	
00000000-0000-0000-0000-000000000000	539b2f2d-a295-45c9-b111-6f2074d96892	{"action":"user_recovery_requested","actor_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da","actor_username":"ashtekar@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-08 03:57:46.949012+00	
00000000-0000-0000-0000-000000000000	e67723f2-ea82-4d80-9f21-ae128fb4e88e	{"action":"login","actor_id":"333f739d-3cdb-4a85-834b-fc3ea6b9b5da","actor_username":"ashtekar@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-08 03:58:07.311327+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
333f739d-3cdb-4a85-834b-fc3ea6b9b5da	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	{"sub": "333f739d-3cdb-4a85-834b-fc3ea6b9b5da", "email": "ashtekar@gmail.com", "email_verified": true, "phone_verified": false}	email	2025-11-04 18:53:42.580306+00	2025-11-04 18:53:42.580393+00	2025-11-04 18:53:42.580393+00	f1483d55-39c1-4608-819c-849917300a01
06677f7f-23b3-4716-89a0-279c95af1813	06677f7f-23b3-4716-89a0-279c95af1813	{"sub": "06677f7f-23b3-4716-89a0-279c95af1813", "email": "ashtekar2010@gmail.com", "email_verified": true, "phone_verified": false}	email	2025-11-06 02:22:42.487548+00	2025-11-06 02:22:42.488217+00	2025-11-06 02:22:42.488217+00	edb752d8-2dd9-417d-bb02-b10a4f69f84e
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
e87c7209-ff79-4d84-8e42-10a890644609	2025-11-04 18:54:42.500081+00	2025-11-04 18:54:42.500081+00	otp	7e9ea0c4-3609-4f0e-a636-5fe0ec3e7dce
b680fe5e-88bc-4309-b33e-bb4d9959d6e2	2025-11-04 23:21:13.492485+00	2025-11-04 23:21:13.492485+00	otp	9fded55a-1feb-44fd-b909-2212bc2bf9ed
8de06285-13ed-4df3-9a53-a8be10140a6f	2025-11-04 23:52:14.49813+00	2025-11-04 23:52:14.49813+00	otp	9dd79127-58bb-45d3-9a7a-9f72d543f7dd
14dffab8-31cc-48f3-bae1-47ca350047a0	2025-11-04 23:54:48.164705+00	2025-11-04 23:54:48.164705+00	otp	506e22ee-c4cd-411b-b347-44bba58c3490
d5336d95-5649-4065-a069-c63c641459f6	2025-11-04 23:58:45.197281+00	2025-11-04 23:58:45.197281+00	otp	a058da71-1e1f-4dfb-970a-5f0e87ab7609
cfa40380-5365-43b0-a13c-c8f690f306e2	2025-11-06 02:23:04.89673+00	2025-11-06 02:23:04.89673+00	otp	23c4c9fc-47d7-42d6-b4b7-69d0c7bb562f
50a65000-a5e5-47ef-ba00-482db8693144	2025-11-08 03:54:25.508014+00	2025-11-08 03:54:25.508014+00	otp	27080f3a-020a-4368-bafd-3b4af2d9e694
8d5efd02-7d52-4e19-b6a7-a95719a97155	2025-11-08 03:58:07.317886+00	2025-11-08 03:58:07.317886+00	otp	47b75e87-a92d-4d8e-90af-3d4d57d48787
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	1	tjzre6tiynu2	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	f	2025-11-04 18:54:42.489798+00	2025-11-04 18:54:42.489798+00	\N	e87c7209-ff79-4d84-8e42-10a890644609
00000000-0000-0000-0000-000000000000	2	qedhky4hk7rb	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	f	2025-11-04 23:21:13.469915+00	2025-11-04 23:21:13.469915+00	\N	b680fe5e-88bc-4309-b33e-bb4d9959d6e2
00000000-0000-0000-0000-000000000000	3	qinzy5easvht	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	f	2025-11-04 23:52:14.490946+00	2025-11-04 23:52:14.490946+00	\N	8de06285-13ed-4df3-9a53-a8be10140a6f
00000000-0000-0000-0000-000000000000	4	qpmsru26zfis	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	f	2025-11-04 23:54:48.114212+00	2025-11-04 23:54:48.114212+00	\N	14dffab8-31cc-48f3-bae1-47ca350047a0
00000000-0000-0000-0000-000000000000	5	55vxtyq4jzma	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	f	2025-11-04 23:58:45.194906+00	2025-11-04 23:58:45.194906+00	\N	d5336d95-5649-4065-a069-c63c641459f6
00000000-0000-0000-0000-000000000000	6	fhqaq56gjafm	06677f7f-23b3-4716-89a0-279c95af1813	f	2025-11-06 02:23:04.873163+00	2025-11-06 02:23:04.873163+00	\N	cfa40380-5365-43b0-a13c-c8f690f306e2
00000000-0000-0000-0000-000000000000	7	d5evbh2kfwhg	06677f7f-23b3-4716-89a0-279c95af1813	f	2025-11-08 03:54:25.48537+00	2025-11-08 03:54:25.48537+00	\N	50a65000-a5e5-47ef-ba00-482db8693144
00000000-0000-0000-0000-000000000000	8	g7zccnll635z	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	f	2025-11-08 03:58:07.315377+00	2025-11-08 03:58:07.315377+00	\N	8d5efd02-7d52-4e19-b6a7-a95719a97155
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter) FROM stdin;
e87c7209-ff79-4d84-8e42-10a890644609	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	2025-11-04 18:54:42.488625+00	2025-11-04 18:54:42.488625+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	24.23.241.131	\N	\N	\N	\N
b680fe5e-88bc-4309-b33e-bb4d9959d6e2	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	2025-11-04 23:21:13.448578+00	2025-11-04 23:21:13.448578+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	24.23.241.131	\N	\N	\N	\N
8de06285-13ed-4df3-9a53-a8be10140a6f	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	2025-11-04 23:52:14.486228+00	2025-11-04 23:52:14.486228+00	\N	aal1	\N	\N	node	54.81.41.47	\N	\N	\N	\N
14dffab8-31cc-48f3-bae1-47ca350047a0	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	2025-11-04 23:54:48.01654+00	2025-11-04 23:54:48.01654+00	\N	aal1	\N	\N	node	54.81.41.47	\N	\N	\N	\N
d5336d95-5649-4065-a069-c63c641459f6	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	2025-11-04 23:58:45.192497+00	2025-11-04 23:58:45.192497+00	\N	aal1	\N	\N	node	54.81.41.47	\N	\N	\N	\N
cfa40380-5365-43b0-a13c-c8f690f306e2	06677f7f-23b3-4716-89a0-279c95af1813	2025-11-06 02:23:04.854145+00	2025-11-06 02:23:04.854145+00	\N	aal1	\N	\N	node	98.92.11.215	\N	\N	\N	\N
50a65000-a5e5-47ef-ba00-482db8693144	06677f7f-23b3-4716-89a0-279c95af1813	2025-11-08 03:54:25.465819+00	2025-11-08 03:54:25.465819+00	\N	aal1	\N	\N	node	34.226.124.68	\N	\N	\N	\N
8d5efd02-7d52-4e19-b6a7-a95719a97155	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	2025-11-08 03:58:07.314133+00	2025-11-08 03:58:07.314133+00	\N	aal1	\N	\N	node	18.209.229.31	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	authenticated	authenticated	ashtekar@gmail.com	$2a$10$bJx9mjvE01LcqXVG726MheQzrQ3fxjIKOHwOts4EmlGiecNqJfgje	2025-11-04 18:54:42.482763+00	2025-11-04 18:53:42.612857+00		\N		2025-11-08 03:57:46.950621+00			\N	2025-11-08 03:58:07.314043+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-04 18:53:42.519033+00	2025-11-08 03:58:07.317423+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	06677f7f-23b3-4716-89a0-279c95af1813	authenticated	authenticated	ashtekar2010@gmail.com	$2a$10$RbAJ0Ov4FN13Zd7zZCiw2uc906ZEYwaYh.c9q9tiUDgHhlmCFFi.e	2025-11-06 02:23:04.849125+00	\N		2025-11-06 02:22:42.510468+00		2025-11-08 03:54:07.74122+00			\N	2025-11-08 03:54:25.465113+00	{"provider": "email", "providers": ["email"]}	{"sub": "06677f7f-23b3-4716-89a0-279c95af1813", "email": "ashtekar2010@gmail.com", "email_verified": true, "phone_verified": false}	\N	2025-11-06 02:22:42.38151+00	2025-11-08 03:54:25.50747+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: article_summaries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.article_summaries (id, article_id, thread_id, summary, model_used, langsmith_run_id, created_at, user_id) FROM stdin;
9019e17a-e534-4f66-a134-95c5c1d94959	article_aHR0cHM6Ly93d3cu	e95dfef2-7c41-4244-b68f-38045932cb45	This paper shows how to make genetic circuits (DNA-based "software" inside cells) smarter and more compact to control cell decisions better. Normally, building circuits that choose between many states (like multiple on/off levels) needs lots of parts, which makes cells slow down or stressed. They designed a way to "compress" circuits—using fewer parts—to get higher-level choices without overloading the cell. They did this by creating new "wetware" (protein parts) plus software tools that predict exactly how to connect things so they work reliably. Their trick is to make parts that do multiple jobs or combine signals tightly, so fewer pieces do more. They also built a computer model that tells you how to design these small, high-state circuits before building them, saving time. So, they made tiny, smarter decision-makers inside cells that are easier on the cell and more predictable.  \n**Source:** [https://www.nature.com/articles/s41467-025-64457-0](https://www.nature.com/articles/s41467-025-64457-0)	gpt-4o-mini	69192f99-e18d-4a96-bb15-77b61ce29178	2025-10-29 23:01:31.369426+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
3a46e406-1737-436a-9e68-5df93373ed57	article_aHR0cHM6Ly93d3cu	6b207353-c60b-423f-abe3-5bba22d21054	This study developed a fast, modular way to build and test custom DNA parts inside the chloroplast (the photosynthesis machine) of *Chlamydomonas* algae. They made a toolkit of interchangeable pieces (like Lego blocks) for inserting genes, promoters, and other parts, so they can quickly assemble many different designs. Using high-throughput methods (testing lots of variants at once), they screened hundreds of combinations to find ones that turn on genes strongly or control expression precisely. They also used a new way to measure how well each design works inside the chloroplast without destroying cells. This lets scientists rapidly optimize genetic circuits for better photosynthesis or making useful compounds. The key is modular, standardized parts + fast testing to engineer chloroplasts more easily. This speeds up making custom chloroplasts for biotech.  \nSource: [https://www.nature.com/articles/s41477-025-02126-2](https://www.nature.com/articles/s41477-025-02126-2)	gpt-4o-mini	06037dc0-4dc1-4aa2-af01-d2a3555b7df3	2025-11-10 00:30:34.158832+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
e19abf25-c80c-4c9b-a8c1-e416433ceca6	article_aHR0cHM6Ly9wdWJz	0d48af8f-50a5-49c6-a803-1de597038f2d	This research shows how scientists are designing tiny DNA programs that work in many different bacteria, not just usual lab strains. Instead of building genes for one special microbe, they make “broad-host-range” parts that can run in lots of microbes—like using one universal app on many phones. They did this by creating DNA parts with flexible control switches and tested them in different bacteria to see if they turn on or off as planned. They used new methods like swapping parts into different microbes easily and measuring activity quickly. This lets them program any microbe, even wild ones, to do useful jobs—like making medicine or breaking stuff down. It’s like making a universal remote for bacteria. So, instead of just one lab bug, now you can program many microbes the same way. More at: https://pubs.acs.org/toc/asbcd6/current	gpt-4o-mini	e93a9f6b-717a-4326-a2b2-8cddd4a9120c	2025-11-02 23:33:38.381105+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
f30d0cca-1134-435c-974e-e7602e0f182c	article_aHR0cHM6Ly9jb25u	0d48af8f-50a5-49c6-a803-1de597038f2d	This study developed a sensitive DNA test (qPCR) to detect tiny amounts of dolphin environmental DNA (eDNA) in water, showing they can monitor dolphin presence without seeing or catching them. They designed specific DNA primers that only stick to dolphin DNA, so they can tell if dolphins are nearby just by water samples. They used tiny DNA probes that light up when they find dolphin DNA, making detection very precise. This approach is like a synthetic biology sensor: a custom DNA "switch" that reports presence. They showed they can detect dolphin DNA at very low levels, even when dolphins are far away. This method could be turned into a portable biosensor—like a DNA "sniffer"—to monitor animals or pollutants in real time. Key is designing specific DNA parts that only turn on with target DNA, a synthetic biology trick.  \nSource: [bioRxiv detection of dolphin eDNA](https://connect.biorxiv.org/archive/)	gpt-4o-mini	9945ef51-35b6-4706-bc94-8e65aae04311	2025-11-02 23:33:44.22898+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
91abfba6-30f3-4d2d-96b9-598f0e23fd2c	article_aHR0cHM6Ly9wdWJt	6b207353-c60b-423f-abe3-5bba22d21054	This review explains how scientists can edit bacterial genomes more precisely and quickly using big-scale DNA tools. They now make tiny, exact changes across the whole bacterial DNA (genome) instead of one gene at a time. New methods use things like CRISPR or DNA "scissors" combined with tricks to target many spots at once, making edits faster and more reliable. They also build DNA parts that can insert or delete big chunks smoothly. This lets design bacteria with new functions or optimize pathways efficiently. The key is combining precise cutting with smart DNA templates and automation, so edits are fast, accurate, and scalable. These advances turn bacteria into customizable "hardware" for biotech, like tiny computers or factories. Overall, they made genome editing more like programming with code—big, precise, and programmable. (See more: https://pubmed.ncbi.nlm.nih.gov/41182907/)	gpt-4o-mini	dd4a7a5b-bd81-47a7-a341-cc850eac8f12	2025-11-10 00:30:34.395502+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
1a5d3e11-4626-4d37-ad73-2461734cd61e	article_aHR0cHM6Ly93d3cu	0d48af8f-50a5-49c6-a803-1de597038f2d	This paper shows new ways to control and boost how we make enzymes and genetic parts work inside cells. They used DNA strands that turn enzymes on or off when they hybridize (stick together), acting like tiny switches—called “thiol switching”—so DNA sequences control enzyme activity precisely. This lets them get both high specificity (only turn on when right DNA is there) and lots of signal (amplify the response). They achieved this by designing DNA strands that change enzyme shape when hybridized, so enzyme activity depends on DNA signals. This approach is clever because it uses DNA hybridization (like sticky puzzle pieces) to control enzymes directly, with fast, reversible switching. It could help build tiny biological circuits that respond only to specific DNA inputs, or amplify signals without messy protein engineering. Basically, they made DNA-controlled enzyme switches that are precise and strong—useful for smarter biotech tools.  \nSource: [https://www.nature.com/subjects/synthetic-biology/ncomms](https://www.nature.com/subjects/synthetic-biology/ncomms)	gpt-4o-mini	7495235d-95e6-47d1-943c-8c7c88ded54c	2025-11-02 23:33:31.078599+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
3bf38e49-ed2b-4b27-8ba7-666e1c8531a7	article_aHR0cHM6Ly9wdWJz	d3a73a11-2907-4188-a0ac-d53caf3e27e2	This study shows that liquid-liquid phase separation (LLPS)—where proteins or molecules form tiny droplets inside cells—can be used as a tool in designing better biological factories. They made special "droplet" compartments that concentrate enzymes and substrates, so reactions happen faster and more efficiently. By engineering proteins to form droplets at will, they created customizable compartments without membranes, guiding metabolic steps exactly where needed. They used new tricks like fusing enzymes to phase-separating tags, so they self-assemble into droplets inside cells. This lets them boost production of chemicals by bringing enzymes together or isolating toxic intermediates. The key idea: control enzyme grouping with droplets to improve flow—no messy membranes needed. This shows LLPS can be a flexible way to organize pathways, making biomanufacturing more precise and dynamic.  \nSource: https://pubs.acs.org/toc/asbcd6/0/0	gpt-4o-mini	a3665c38-8cdc-453c-a420-f3a95904a98d	2025-10-30 19:28:43.818464+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
a5865b82-5706-4992-9271-17b912a40c52	article_aHR0cHM6Ly93d3cu	d3a73a11-2907-4188-a0ac-d53caf3e27e2	This study developed new ways to build smarter, smaller genetic circuits that make cells decide among more options (higher states) with fewer parts. Normally, making cells do complex choices needs lots of DNA parts (like switches), which makes the cell slow and stressed. The researchers created a "wetware" (DNA parts + proteins) + software tools to design compact circuits that get many decision levels using fewer parts—like squeezing more info into less code. They did this by mathematically modeling how parts combine and tuning them so they can reliably switch between multiple states without extra parts. They also made a "compressed" logic design that stacks decision steps tightly, saving space and burden. Key is a predictive, math-based method to choose parts so circuits are precise and simple. This lets you program cells to make smarter choices with less load.  \n**More at:** https://www.nature.com/articles/s41467-025-64457-0	gpt-4o-mini	f0915f23-f28a-43ed-bed9-12dcc7a7e440	2025-10-30 19:28:43.86284+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
f88ab315-85d2-424f-950e-8d693cd39f12	article_aHR0cHM6Ly9wbWMu	6b207353-c60b-423f-abe3-5bba22d21054	This article describes how Australia is building better tools and teamwork to design custom biology parts—like tiny DNA switches or circuits—using synthetic biology. They set up new labs and shared resources so scientists can make and test engineered microbes faster. They used clever ways to connect different parts (like Lego blocks) into bigger systems, and shared data openly so everyone can improve designs. They also made special “bio factories” that produce useful chemicals or medicines cheaply. Key ideas: Australia’s big infrastructure (labs, data), teamwork across groups, and new methods to quickly test many designs at once. They made robots and automated tests to try lots of DNA combos fast, saving time. Overall, they’re making biology more like engineering—building predictable, reliable parts—and sharing tools so others can do the same.  \nSource: [https://pmc.ncbi.nlm.nih.gov/articles/PMC12588174/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12588174/)	gpt-4o-mini	498d229f-b84e-4ef0-b4b1-95b628c928ee	2025-11-10 00:30:38.86682+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
ff1a6586-1652-4dc3-9d1c-930e8c88ce0c	article_aHR0cHM6Ly93d3cu	1b09fb41-699d-4122-a450-1461f8c47a9c	This study developed a way to make genetic circuits (biological "software") that can make cells choose between more than two options (higher-state decisions) using fewer parts ("wetware"). Normally, building complex circuits needs many DNA parts, which makes cells work harder and less reliable. To fix this, they designed compressed, efficient circuits that do more with less, using smarter arrangements of parts and a new way to predict how they'll behave. They also created software that models how these circuits work so you can design them on a computer before building. Key idea: by "stacking" decision steps tightly and predicting behavior, they make circuits that are smaller, faster, and less burdening for the cell. This lets you program cells to do more complex choices without overloading them. They achieved this with a mix of clever DNA design and math models to predict outcomes.  \nSource: [https://www.nature.com/articles/s41467-025-64457-0](https://www.nature.com/articles/s41467-025-64457-0)	gpt-4o-mini	4d763043-9944-4f56-a9c6-63821bd055c1	2025-10-31 01:01:15.375313+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
c62c6b19-61bd-4caf-85b7-98f2fe95ba1e	article_aHR0cHM6Ly9wdWJt	1b09fb41-699d-4122-a450-1461f8c47a9c	This study engineered bacteria to act like tiny, smart cancer fighters that only attack tumors. They programmed bacteria using synthetic biology—like building biological "software"—so they only turn on inside tumors. They added genetic switches that sense tumor signals (like low oxygen or specific chemicals) to turn bacteria on. Once inside, bacteria produce cancer-killing proteins or release drugs right at the tumor, sparing healthy tissue. They also made bacteria self-destruct after doing their job, so they don't spread too much. To do this, they used new gene circuits that tightly control when bacteria activate and die, using sensors and timers. This creates precise, safe bacteria that hunt tumors only when needed. Key is designing genetic "logic" inside bacteria to sense tumor cues and respond automatically—like biological computers. This shows how synthetic gene circuits can turn bacteria into targeted, programmable cancer medicines.  \nSource: [https://pubmed.ncbi.nlm.nih.gov/41128615/](https://pubmed.ncbi.nlm.nih.gov/41128615/)	gpt-4o-mini	504e0ec1-98e5-485c-a3c3-99609dbdb0af	2025-10-31 01:01:17.733749+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
13213d43-0d17-4cf3-8d15-5c0aae16e40d	article_aHR0cHM6Ly9wbWMu	1b09fb41-699d-4122-a450-1461f8c47a9c	This paper describes tiny DNA-based tools that act like electronic logic gates (like AND, OR, NOT) inside cells or test tubes. They use strands of nucleic acids (DNA/RNA) that change shape or stick together when they detect specific molecules, so they can "compute" by turning signals on or off. The researchers built smart DNA circuits that only produce a signal if certain inputs are present—like a molecular "if-then" decision. They made new ways to assemble these DNA parts so they can do more complex tasks, like sensing multiple things at once or making decisions. They achieved this by designing special DNA strands that only connect when inputs match, creating reliable, programmable logic. This lets scientists build tiny, programmable sensors or controllers inside cells that "think" using DNA rules—like mini computers made of molecules.  \n**More at:** https://pmc.ncbi.nlm.nih.gov/articles/PMC12548754/	gpt-4o-mini	74ef28dd-380b-44b7-a7fd-efbce922f417	2025-10-31 01:01:24.179004+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
02577182-5a1e-45dc-bca0-63d36003dd0d	article_aHR0cHM6Ly9wdWJz	1b09fb41-699d-4122-a450-1461f8c47a9c	This study shows how scientists use precise gene tools (like CRISPR-Cas9, Cas3, and CRISPRi) to redesign bacteria’s DNA quickly and exactly. They can turn genes on/off or delete parts of the genome to make bacteria do new things—like produce medicines or fuels—more efficiently. They combined different CRISPR methods to control big chunks of DNA at once, not just single genes. They also made new ways to target multiple spots at once (“multiplexing”) so many edits happen together. This lets them program bacteria like tiny factories, customizing their DNA fast and cleanly. The key is using smart guides and DNA “scissors” to rewrite big parts of the genome without messing up other parts. So, they made a toolkit for fast, multi-gene design, making bacteria smarter for biotech.  \n[Source: https://pubs.acs.org/toc/asbcd6/0/0](https://pubs.acs.org/toc/asbcd6/0/0)	gpt-4o-mini	cfeb4c35-5946-46e3-ab93-86a170187079	2025-10-31 19:05:53.725971+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
\.


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.articles (id, title, url, content, published_date, source, relevancy_score, created_at, updated_at) FROM stdin;
article_aHR0cHM6Ly93d3cu	Application progress and biosafety challenges of gene editing and ...	https://www.sciencedirect.com/science/article/pii/S2590053625001296	Application progress and biosafety challenges of gene editing and synthetic biotechnology in diagnosis, treatment and prevention of infectious diseases - ScienceDirect JavaScript is disabled on your browser. Please enable JavaScript to use all the features on this page. Skip to main content Skip to article ScienceDirect Journals &amp; Books Help Search My account Sign in View&nbsp; PDF Search ScienceDirect Biosafety and Health Available online 1 September 2025 In Press, Corrected Proof What’s this? Review Article Application progress and biosafety challenges of gene editing and synthetic biotechnology in diagnosis, treatment and prevention of infectious diseases ☆ Author links open overlay panel Zixuan Gao a 1 , Yuanjiao Gao a 1 , Shuojie Wang a 1 , Xinxin Li a 1 , Weihua Cao a , Wen Deng a , Linmei Yao a , Xin Wei a , Ziyu Zhang a , Shiyu Wang a , Yaqin Zhang a , Minghui Li a b , Yao Xie a b 2 Show more Add to Mendeley Share Cite https://doi.org/10.1016/j.bsheal.2025.09.002 Get rights and content Under a Creative Commons license Open access Highlights • CRISPR/Cas diagnostics pose dual-use risks for potential pathogen enhancement. • mRNA vaccines face challenges of delivery toxicity, immune evasion, and instability. • Engineered probiotics carry risks of environmental release and horizontal gene transfer. • Lack of unified regulation increases risks of ethical lapses, inadequate risk assessment, and biosafety failures. Abstract Global infectious disease prevention and control is facing severe challenges due to the frequent emergence of novel pathogens and the rapid mutation of viruses. Synthetic biology, by enabling the engineering of living systems, has offered significant breakthroughs in precise diagnostics, vaccine development, and targeted therapies. However, these advancements are also accompanied by risks related to dual-use potential, biosafety, and ethical concerns. This study conducts a systematic review of literature from 2015 to 2025 retrieved from PubM...	2025-10-15 23:10:53.042	sciencedirect.com	0.60	2025-10-15 23:11:09.521	2025-10-15 23:11:09.521
article_aHR0cHM6Ly9hY2Fk	SELECT: high-precision genome editing strategy via integration of ...	https://academic.oup.com/nar/article/53/12/gkaf595/8174775	[Access Restricted - Using Title/Snippet Only] Jun 26, 2025 ... Precise genome editing is a cornerstone of synthetic biology and metabolic engineering. ... protein for inactivating the galK gene in the CRISPR–Cas systems. (E) ...	2025-10-15 23:10:53.043	academic.oup.com	0.52	2025-10-15 23:11:09.521	2025-10-15 23:11:09.521
article_aHR0cHM6Ly9wbWMu	Harnessing the Microbiome: CRISPR-Based Gene Editing and ...	https://pmc.ncbi.nlm.nih.gov/articles/PMC12405046/	Harnessing the Microbiome: CRISPR-Based Gene Editing and Antimicrobial Peptides in Combating Antibiotic Resistance and Cancer - PMC Skip to main content An official website of the United States government Here's how you know Here's how you know Official websites use .gov A .gov website belongs to an official government organization in the United States. Secure .gov websites use HTTPS A lock ( Lock Locked padlock icon ) or https:// means you've safely connected to the .gov website. Share sensitive information only on official, secure websites. Search Log in Dashboard Publications Account settings Log out Search… Search NCBI Primary site navigation Search Logged in as: Dashboard Publications Account settings Log in Search PMC Full-Text Archive Search in PMC Journal List User Guide PERMALINK Copy As a library, NLM provides access to scientific literature. Inclusion in an NLM database does not imply endorsement of, or agreement with, the contents by NLM or the National Institutes of Health. Learn more: PMC Disclaimer | PMC Copyright Notice Probiotics Antimicrob Proteins . 2025 May 16;17(4):1938–1968. doi: 10.1007/s12602-025-10573-8 Search in PMC Search in PubMed View in NLM Catalog Add to search Harnessing the Microbiome: CRISPR-Based Gene Editing and Antimicrobial Peptides in Combating Antibiotic Resistance and Cancer Radwa A Amen Radwa A Amen 1 Department of Biotechnology, Faculty of Science, Cairo University, Cairo, Egypt Find articles by Radwa A Amen 1 , Yaser M Hassan Yaser M Hassan 2 Biotechnology Program, Faculty of Science, Ain Shams University, Abbassia, Cairo, 11566 Egypt Find articles by Yaser M Hassan 2 , Rawan A Essmat Rawan A Essmat 3 Faculty of Pharmacy, Modern University for Information and Technology, Cairo, 11728 Egypt Find articles by Rawan A Essmat 3 , Rana H Ahmed Rana H Ahmed 4 Biotechnology Program, Faculty of Science, Mansoura University, Mansoura, 35516 Egypt Find articles by Rana H Ahmed 4 , Marwan M Azab Marwan M Azab 5 Molecular Biotechnology...	2025-10-15 23:10:53.043	pmc.ncbi.nlm.nih.gov	0.52	2025-10-15 23:11:09.521	2025-10-15 23:11:09.521
article_aHR0cDovL3d3dy5i	End-to-end automation of repeat-target cryo-EM structure ...	http://www.biorxiv.org/content/10.1101/2025.10.17.682689	[Access Restricted - Using Title/Snippet Only] 2 days ago ... CryoSPARC Team Structura Biotechnology Inc., Kelly Barber, Hannah Bridges, Suhail Dawood, Katherine Elder, Nick Frasser, Fiona Hu, Serena Liu, ...	2025-10-20 00:00:00	biorxiv.org	0.20	2025-10-23 01:37:18.793	2025-10-23 01:37:18.793
article_aHR0cHM6Ly9lY29l	Behind the Paper | Research Communities by Springer Nature	https://ecoevocommunity.nature.com/channels/521-behind-the-paper	Behind the Paper | Research Communities by Springer Nature Skip to main content Share your thoughts about the Research Communities in our survey . Menu Icon Research Communities by Springer Nature Register Sign In Home Activity Feed ECR Hub NEW! Collection Hubs Health &amp; Clinical Research Biomedical Research General &amp; Internal Medicine Healthcare &amp; Nursing Paediatrics, Reproductive Medicine &amp; Geriatrics Pharmacy &amp; Pharmacology Public Health Surgery Humanities &amp; Social Sciences Arts &amp; Humanities Behavioural Sciences &amp; Psychology Business &amp; Management Economics Education Law, Politics &amp; International Studies Philosophy &amp; Religion Social Sciences Life Sciences Agricultural &amp; Food Science Anatomy &amp; Physiology Bioengineering &amp; Biotechnology Cancer Cell &amp; Molecular Biology Ecology &amp; Evolution Genetics &amp; Genomics Immunology Microbiology Neuroscience Plant Science Zoology &amp; Veterinary Science Mathematics, Physical &amp; Applied Sciences Astronomy Chemistry Civil Engineering Computational Sciences Earth &amp; Environment Electrical &amp; Electronic Engineering Materials Mathematical &amp; Computational Engineering applications Mathematics Mechanical Engineering Physics Statistics Protocols &amp; Methods Research Data Sustainability Help and Support How do I create a post? Communities Guidelines Find a Journal Register Sign In Behind the Paper The real stories behind the latest research papers, from conception to publication, the highs and the lows Follow Noninvasive On‑Skin Biosensors for Monitoring Diabetes Mellitus Nano-Micro Letters Editor Behind the Paper , From the Editors Noninvasive On‑Skin Biosensors for Monitoring Diabetes Mellitus Lillian Zhang Oct 22, 2025 Quantum‑Size FeS2 with Delocalized Electronic Regions Enable High‑Performance Sodium‑Ion Batteries Across Wide Temperatures Nano-Micro Letters Editor Behind the Paper , From the Editors Quantum‑Size FeS2 with Delocalized Electronic Regions En...	2025-10-23 01:37:02.892	ecoevocommunity.nature.com	0.20	2025-10-23 01:37:18.793	2025-10-23 01:37:18.793
article_aHR0cDovL2Nvbm5l	bioRxiv directory	http://connect.biorxiv.org/archive/show_cat.php?cat=zoology	bioRxiv directory Skip to main content Home About Submit Alerts RSS date is show_cat.php Select an archive month &nbsp; October 2025 September 2025 August 2025 July 2025 June 2025 May 2025 April 2025 March 2025 February 2025 January 2025 December 2024 November 2024 October 2024 September 2024 August 2024 July 2024 June 2024 May 2024 April 2024 March 2024 February 2024 January 2024 December 2023 November 2023 October 2023 September 2023 August 2023 July 2023 June 2023 May 2023 April 2023 March 2023 February 2023 January 2023 December 2022 November 2022 October 2022 September 2022 August 2022 July 2022 June 2022 May 2022 April 2022 March 2022 February 2022 January 2022 December 2021 November 2021 October 2021 September 2021 August 2021 July 2021 June 2021 May 2021 April 2021 March 2021 February 2021 January 2021 December 2020 November 2020 October 2020 September 2020 August 2020 July 2020 June 2020 May 2020 April 2020 March 2020 February 2020 January 2020 December 2019 November 2019 October 2019 September 2019 August 2019 July 2019 June 2019 May 2019 April 2019 March 2019 February 2019 January 2019 December 2018 November 2018 October 2018 September 2018 August 2018 July 2018 June 2018 May 2018 April 2018 March 2018 February 2018 January 2018 December 2017 November 2017 October 2017 September 2017 August 2017 July 2017 June 2017 May 2017 April 2017 March 2017 February 2017 January 2017 December 2016 November 2016 October 2016 September 2016 August 2016 July 2016 June 2016 May 2016 April 2016 March 2016 February 2016 January 2016 December 2015 November 2015 October 2015 September 2015 August 2015 July 2015 June 2015 May 2015 April 2015 March 2015 February 2015 January 2015 December 2014 November 2014 October 2014 September 2014 August 2014 July 2014 June 2014 May 2014 April 2014 March 2014 February 2014 January 2014 December 2013 November 2013 Archive, 2025-10 1 Opposing seasonal dynamics in phylogenetic and flower color diversity of co-flowering wildflower assemblages ...	2025-10-23 01:37:02.893	connect.biorxiv.org	0.20	2025-10-23 01:37:18.793	2025-10-23 01:37:18.793
article_aHR0cHM6Ly9wdWJz	ACS Synthetic Biology Journal - ACS Publications	https://pubs.acs.org/journal/asbcd6	[Access Restricted - Using Title/Snippet Only] 1 day ago ... Read current and featured research from the ACS Synthetic Biology on ACS Publications, a trusted source for peer-reviewed journals.	2025-10-23 18:45:55.578	pubs.acs.org	0.20	2025-10-23 18:46:15.607	2025-10-23 18:46:15.607
article_aHR0cHM6Ly9zeW5i	SynBioBeta - Synthetic Biology Events, Info, & Industry Information	https://synbiobeta.com/	SynBioBeta - Synthetic Biology Events, Info, &amp; Industry Information exit to SBB First Last Dashboard first.last@synbiobeta.com Logout Register Login SEARCH INSIGHTS INDUSTRY NEWS NEWSLETTERS EVENTS VIDEO PODCASTS &amp; AUDIO JOB BOARD ABOUT SYNBIOBETA CONTACT US ADVERTISING SUBSCRIBE Site Search Sign Up for Updates! Hide Sign Up for Updates! Keep up with the latest in synthetic biology! Sign up for our weekly digest for exclusive insights and the newest trends in SynBio. Join our community today! Sign Up Now October 22, 2025 Symrise and Cellibre Partner to Deliver Precision-Fermented Products Today October 22, 2025 Symrise and Cellibre Partner to Deliver Precision-Fermented Products Today October 21, 2025 Integrated DNA Technologies and Profluent Forge New AI-Driven Protein Design Partnership INSIGHTS INDUSTRY NEWS MULTIMEDIA CONFERENCE 2025 EVENTS SUBSCRIBE ADVERTISING MULTIMEDIA MORE CLOSE ADVERTISING EVENTS SUBSCRIBE INSIGHTS View all insights » October 21, 2025 Waypoint Bio Appoints Meta NeuroAI Pioneer Patrick Kaifosh as Chief Technology Officer October 14, 2025 Plasmidsaurus Unveils $80 RNA-Seq in as Fast as 3-Days FEATURED EVENT View all events » SynBioBeta 2026 May 4-7 2026 Learn More LATEST NEWS View all news » Gourmey Acquires Vital Meat to Form PARIMA, a Global Leader in Next-Generation Animal Production October 21, 2025 Caldic and AmphiStar Collaborate to Revolutionize Personal Care with Upcycled Biosurfactants October 21, 2025 Ansa Biotechnologies Secures $54.4 Million in Series B Financing to Redefine How Scientists Access Synthetic DNA with Industry’s First Guaranteed On-Time Service October 3, 2025 VIDEOS View all videos » Fermenting the Future While Making Biomanufacturing Nimble - with Shannon Hall April 25, 2025 From Microbes to Materials: ZymoChem&#x27;s Vision for a Plastic-Free Future April 10, 2025 Subscriber Only Medicine on Demand- Reimagining Drug Development Through Oligo Innovation August 15, 2024 Subscriber Only Ethics Elixirs and En...	2025-10-23 18:45:55.578	synbiobeta.com	0.20	2025-10-23 18:46:15.607	2025-10-23 18:46:15.607
article_aHR0cHM6Ly9jZW4u	Conservationists clash over the use of synthetic biology	https://cen.acs.org/biological-chemistry/synthetic-biology/Conservationists-clash-over-use-synthetic/103/web/2025/10	Conservationists clash over the use of synthetic biology Advertisement ACS ACS Publications C&amp;EN CAS Jobs Main menu News Topics Newsletter Podcasts Explore Explore Skip Explore section Features Perspectives Interviews ACS News Graphics Chempics Games Newscripts Webinars Whitepapers &amp; E-books Highlights Highlights Skip Highlights section Trailblazers: Chemists with disabilities rethink how we do science New Normal: Living at wildfires&#39; edge US science research was gutted in 2025. How will it rebuild? Global Top 50 Chemical Companies Interactive Table Talented Twelve Previous Years 10 Start-ups to Watch Previous Years TOPICS TOPICS Skip TOPICS section ACS News Analytical Chemistry Biological Chemistry Business Careers Education Energy Environment Food Materials People Pharmaceuticals Physical Chemistry Policy Research Integrity Safety Synthesis MAGAZINE MAGAZINE Skip Magazine section Volume 103 | Issue 21 October 20, 2025 Previous Issues Search Search C&amp;EN Search C&amp;EN Search News Topics Newsletter Podcasts Trending: Nobel Prizes Vaccines Cleantech Conservationists clash over the use of synthetic biology Share Features Synthetic Biology Conservationists clash over the use of synthetic biology But at global conservation forum, a vote to ban genetically modified wildlife fails by Max Barnhart October 16, 2025 10 min read Share Juvenile Australian southern corroboree frogs at the University of Melbourne laboratories Credit: Tiffany Kosch Features Recurring stories and special news packages from C&amp;EN. View Collection Key Insights The International Union for Conservation of Nature and Natural Resources Members’ Assembly rejected a moratorium on the release of genetically modified organisms in the wild. Proponents of the use of synthetic biology say it could bring some species back from the brink of extinction and help fight malaria. Critics argue that the risks aren’t fully defined. Abu Dhabi, United Arab Emirates —On Oct. 15, after 6 days of debate ...	2025-10-23 18:45:55.578	cen.acs.org	0.20	2025-10-23 18:46:15.607	2025-10-23 18:46:15.607
article_aHR0cHM6Ly9heGlh	Biological and Medicinal Chemistry Lectureships and Awards	https://axial.acs.org/biology-and-biological-chemistry/biological-and-medicinal-chemistry-lectureships-and-awards	Biological and Medicinal Chemistry Lectureships and Awards ACS ACS Publications C&amp;EN CAS Biology and Biological Chemistry Biological and Medicinal Chemistry Lectureships and Awards Nathan Quinn Oct 10, 2025 3 min read Explore both current and past journal lectureships and awards from ACS Publications&#x27; Biological and Medicinal Chemistry portfolios. Updated October 2025 Nominations for some 2026 awards are now open; others coming soon. Read on to learn more about each award and how to submit a nomination—and check back for newly opened opportunities. ACS Publications&#x27; journal lectureships and awards recognize a mix of early career and established investigators who have made significant contributions to research in their fields. We invite you to explore current and past awards in Biological and Medicinal Chemistry—and submit your nominations for 2026! ACS Infectious Diseases Early Career Award Nomination Status : Open Deadline : December 1, 2025 Sponsored by ACS Infectious Diseases and the ACS Division of Biochemistry and Chemical Biology , these awards recognize three outstanding early-career investigators in the field of infectious diseases. Submit Your Nomination View Previous Winners: ACS Infectious Diseases Early Career Award ACS Synthetic Biology Early Career Innovator Award Nomination Status : Open Deadline : December 1, 2025 Sponsored by ACS Synthetic Biology and The American Institute of Chemical Engineers , this award honors the contributions of an early-career scientist who has made a major impact on synthetic biology and/or related fields. Submit Your Nomination View Previous Winners: ACS Synthetic Biology Early Career Innovator Award Philip S. Portoghese Medicinal Chemistry Lectureship Nomination Status : Open Deadline : December 1, 2025 Sponsored by the Journal of Medicinal Chemistry and the ACS Division of Medicinal Chemistry , this award is named for Philip S. Portoghese, Editor-in-Chief of the Journal of Medicinal Chemistry from 1972 to 2...	2025-10-10 16:00:00	axial.acs.org	0.16	2025-10-23 18:46:15.607	2025-10-23 18:46:15.607
article_aHR0cHM6Ly9wdWJt	Engineering oncolytic bacteria as precision cancer therapeutics ...	https://pubmed.ncbi.nlm.nih.gov/41128615/?utm_source=FeedFetcher&utm_medium=rss&utm_campaign=None&utm_content=1reoklHRwDJzyept9vxlMOURIffEN14pDiIr51Mxa7PQcCu19_&fc=None&ff=20251026004003&v=2.18.0.post22+67771e2	[Access Restricted - Using Title/Snippet Only] 7 days ago ... Affiliations. 1 Shanghai Frontiers Science Center of Genome Editing and Cell Therapy, Biomedical Synthetic Biology Research Center, Shanghai Key Laboratory ...	2025-10-31 01:00:47.894	pubmed.ncbi.nlm.nih.gov	0.20	2025-10-31 01:01:03.623	2025-10-31 01:01:03.623
article_aHR0cHM6Ly9jb25u	bioRxiv directory	https://connect.biorxiv.org/archive/	bioRxiv directory Skip to main content Home About Submit Alerts RSS Select an archive month &nbsp; November 2025 October 2025 September 2025 August 2025 July 2025 June 2025 May 2025 April 2025 March 2025 February 2025 January 2025 December 2024 November 2024 October 2024 September 2024 August 2024 July 2024 June 2024 May 2024 April 2024 March 2024 February 2024 January 2024 December 2023 November 2023 October 2023 September 2023 August 2023 July 2023 June 2023 May 2023 April 2023 March 2023 February 2023 January 2023 December 2022 November 2022 October 2022 September 2022 August 2022 July 2022 June 2022 May 2022 April 2022 March 2022 February 2022 January 2022 December 2021 November 2021 October 2021 September 2021 August 2021 July 2021 June 2021 May 2021 April 2021 March 2021 February 2021 January 2021 December 2020 November 2020 October 2020 September 2020 August 2020 July 2020 June 2020 May 2020 April 2020 March 2020 February 2020 January 2020 December 2019 November 2019 October 2019 September 2019 August 2019 July 2019 June 2019 May 2019 April 2019 March 2019 February 2019 January 2019 December 2018 November 2018 October 2018 September 2018 August 2018 July 2018 June 2018 May 2018 April 2018 March 2018 February 2018 January 2018 December 2017 November 2017 October 2017 September 2017 August 2017 July 2017 June 2017 May 2017 April 2017 March 2017 February 2017 January 2017 December 2016 November 2016 October 2016 September 2016 August 2016 July 2016 June 2016 May 2016 April 2016 March 2016 February 2016 January 2016 December 2015 November 2015 October 2015 September 2015 August 2015 July 2015 June 2015 May 2015 April 2015 March 2015 February 2015 January 2015 December 2014 November 2014 October 2014 September 2014 August 2014 July 2014 June 2014 May 2014 April 2014 March 2014 February 2014 January 2014 December 2013 November 2013 Archive, 2025-11 1 Detection of environmental DNA of the Indo-Pacific humpback dolphins in Hong Kong waters using quantitative PCR Kise...	2025-11-02 23:33:13.758	connect.biorxiv.org	0.20	2025-11-02 23:33:21.142	2025-11-02 23:33:21.142
\.


--
-- Data for Name: daily_summaries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_summaries (id, thread_id, collated_summary, html_content, collation_model, articles_summarized, langsmith_run_id, created_at) FROM stdin;
624db66f-091c-4f64-bf6b-f1380ce7c10d	e95dfef2-7c41-4244-b68f-38045932cb45	<p style="margin-left:20px;">• <strong>Tiny, efficient genetic circuits and design tools:</strong> Researchers developed compact, multi-input logic gates in cells by combining smart DNA parts and software that automatically pick minimal, multi-use components—like puzzle pieces that fit perfectly—so cells process more info with fewer genes, saving space and energy. They also created predictive models and "wetware" (protein parts) to reliably compress complex decision-making into tiny circuits that are predictable and less burdensome, enabling smarter cell controllers for biotech and medicine.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Making gene control stable and predictable:</strong> Using small, permanent DNA tweaks (DIAL), they programmed gene promoters to set stable, tunable expression levels—like a thermostat—so cells remember desired outputs even amid noisy signals. Guided by physics-based models, these edits turn transient inputs into fixed states with minimal changes, enabling robust, minimal DNA control of gene activity—great for consistent circuits or therapies.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Understanding muscle tension and sensing:</strong> By precisely removing titin’s tension inside muscle cells—using molecular switches—they showed loss of tension causes weakening and atrophy because muscles sense less force and think they’re damaged. Controlling tension directly reveals how titin’s pull maintains muscle health, guiding designs that restore or sense force to keep muscles strong.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Linking DNA accessibility and gene activity in single cells:</strong> Using pooled CRISPR edits plus joint chromatin-RNA profiling, they mapped direct, cell-by-cell links between DNA openness and RNA output—like reading hardware and software together—so they can design DNA switches or regulators that reliably turn genes on/off based on chromatin state, enabling precise, direct control of gene regulation.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Building precise, programmable tools and tissues:</strong> They used microfluidic channels with gradients to mimic development, focused ultrasound to 3D print inside cells, inducible CRISPR to edit non-dividing cells on demand, and tissue expansion plus mass spec to see proteins at tiny spots—creating highly controlled, spatially precise bio-structures and programmable tissues, key for custom circuits or tissue engineering.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Discovering gene switches for regeneration:</strong> In live mice, in vivo CRISPR screens found genes that turn liver regeneration on/off—like switches—by testing many edits at once. This reveals genetic “lego parts” to program tissue repair circuits that activate growth when needed, enabling smarter, tunable regenerative controls inside the body.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Controlling DNA logic by stacking bases:</strong> Instead of rebuilding DNA shapes, they tuned tiny base-stacking interactions—like adjusting how stickers sit—to flip DNA switches on/off instantly with minimal tweaks. Fast, precise, and reversible, this mimics quick cell rewiring with simple stacking tweaks, enabling flexible, programmable DNA devices that switch states by stacking, not shape.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Fast, scalable cell sensors for design:</strong> They built a glowing sensor linked to DNA parts so cells report specific behaviors—like making a molecule—then sorted thousands of variants by activity with flow cytometry, sequencing only the best. This links cell output directly to DNA design, guiding rapid, scalable optimization of circuits based on behavior, not just sequence.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Finding unique plant genes for new parts:</strong> By assembling a “super-pangenome” of 123 bryophyte genomes, they showed mosses have many lineage-specific, diverse genes—more than big plants—so they’re a rich source of special, possibly useful parts for synthetic biology. These unique, lineage-specific genes expand the toolkit for custom circuits and parts, more than shared plant genes do.</p>	<p style="margin-left:20px;">• <strong>Tiny, efficient genetic circuits and design tools:</strong> Researchers developed compact, multi-input logic gates in cells by combining smart DNA parts and software that automatically pick minimal, multi-use components—like puzzle pieces that fit perfectly—so cells process more info with fewer genes, saving space and energy. They also created predictive models and "wetware" (protein parts) to reliably compress complex decision-making into tiny circuits that are predictable and less burdensome, enabling smarter cell controllers for biotech and medicine.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Making gene control stable and predictable:</strong> Using small, permanent DNA tweaks (DIAL), they programmed gene promoters to set stable, tunable expression levels—like a thermostat—so cells remember desired outputs even amid noisy signals. Guided by physics-based models, these edits turn transient inputs into fixed states with minimal changes, enabling robust, minimal DNA control of gene activity—great for consistent circuits or therapies.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Understanding muscle tension and sensing:</strong> By precisely removing titin’s tension inside muscle cells—using molecular switches—they showed loss of tension causes weakening and atrophy because muscles sense less force and think they’re damaged. Controlling tension directly reveals how titin’s pull maintains muscle health, guiding designs that restore or sense force to keep muscles strong.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Linking DNA accessibility and gene activity in single cells:</strong> Using pooled CRISPR edits plus joint chromatin-RNA profiling, they mapped direct, cell-by-cell links between DNA openness and RNA output—like reading hardware and software together—so they can design DNA switches or regulators that reliably turn genes on/off based on chromatin state, enabling precise, direct control of gene regulation.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Building precise, programmable tools and tissues:</strong> They used microfluidic channels with gradients to mimic development, focused ultrasound to 3D print inside cells, inducible CRISPR to edit non-dividing cells on demand, and tissue expansion plus mass spec to see proteins at tiny spots—creating highly controlled, spatially precise bio-structures and programmable tissues, key for custom circuits or tissue engineering.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Discovering gene switches for regeneration:</strong> In live mice, in vivo CRISPR screens found genes that turn liver regeneration on/off—like switches—by testing many edits at once. This reveals genetic “lego parts” to program tissue repair circuits that activate growth when needed, enabling smarter, tunable regenerative controls inside the body.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Controlling DNA logic by stacking bases:</strong> Instead of rebuilding DNA shapes, they tuned tiny base-stacking interactions—like adjusting how stickers sit—to flip DNA switches on/off instantly with minimal tweaks. Fast, precise, and reversible, this mimics quick cell rewiring with simple stacking tweaks, enabling flexible, programmable DNA devices that switch states by stacking, not shape.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Fast, scalable cell sensors for design:</strong> They built a glowing sensor linked to DNA parts so cells report specific behaviors—like making a molecule—then sorted thousands of variants by activity with flow cytometry, sequencing only the best. This links cell output directly to DNA design, guiding rapid, scalable optimization of circuits based on behavior, not just sequence.</p>\n<hr>\n<p style="margin-left:20px;">• <strong>Finding unique plant genes for new parts:</strong> By assembling a “super-pangenome” of 123 bryophyte genomes, they showed mosses have many lineage-specific, diverse genes—more than big plants—so they’re a rich source of special, possibly useful parts for synthetic biology. These unique, lineage-specific genes expand the toolkit for custom circuits and parts, more than shared plant genes do.</p>	ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1	10	7fca0bc2-8255-4c83-b749-9a67107de4d7	2025-10-29 23:02:04.889901+00
d4ea4586-b0cc-435e-a958-a5235b38808f	d3a73a11-2907-4188-a0ac-d53caf3e27e2	\n    <div class="intro-section">\n      <p>Today's newsletter covers <strong>10 articles</strong> in synthetic biology and biotechnology.</p>\n    </div>\n  \n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed new ways to build smarter, smaller genetic circuits that make cells decide among more options (higher states) with fewer parts. Normally, making cells do complex choices needs lots of DNA parts (like switches), which makes the cell slow and stressed. The researchers created a "wetware" (DNA parts + proteins) + software tools to design compact circuits that get many decision levels using fewer parts—like squeezing more info into less code. They did this by mathematically modeling how parts combine and tuning them so they can reliably switch between multiple states without extra parts. They also made a "compressed" logic design that stacks decision steps tightly, saving space and burden. Key is a predictive, math-based method to choose parts so circuits are precise and simple. This lets you program cells to make smarter choices with less load.  \n**More at:** https://www.nature.com/articles/s41467-025-64457-0\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/asbcd6/current">\n          ACS Synthetic Biology Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows that liquid-liquid phase separation (LLPS)—where proteins or molecules form tiny droplets inside cells—can be used as a tool in designing better biological factories. They made special "droplet" compartments that concentrate enzymes and substrates, so reactions happen faster and more efficiently. By engineering proteins to form droplets at will, they created customizable compartments without membranes, guiding metabolic steps exactly where needed. They used new tricks like fusing enzymes to phase-separating tags, so they self-assemble into droplets inside cells. This lets them boost production of chemicals by bringing enzymes together or isolating toxic intermediates. The key idea: control enzyme grouping with droplets to improve flow—no messy membranes needed. This shows LLPS can be a flexible way to organize pathways, making biomanufacturing more precise and dynamic.  \nSource: https://pubs.acs.org/toc/asbcd6/0/0\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/asbcd6/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/asbcd6/current">\n          ACS Synthetic Biology Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows how engineers can make cells produce chemicals better without hurting them. When we reprogram bacteria to make stuff (metabolic engineering), putting in new pathways can slow them down or kill them (metabolic burden). To fix this, the authors made a system that turns production on only when the cell is healthy—using sensors that detect cell stress or energy levels. They built a “dynamic control”: the cell automatically reduces production if stressed, then turns it back on when OK. They did this with genetic parts that sense signals and switch gene activity—like a smart switch. This keeps cells happy and makes more chemical overall. It’s a new way to make cell factories smarter and more stable, by letting cells control when they make stuff. Key idea: feedback control for better, less toxic production.  \nSource: [ACS Synthetic Biology](https://pubs.acs.org/toc/asbcd6/current)\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/asbcd6/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows how to make tiny genetic circuits in cells that do smarter things with less DNA. They built small "logic gates" (like yes/no switches) that take 3 inputs and decide what to do, but use fewer parts so the cell isn't overwhelmed. To do this, they designed both the DNA parts ("wetware") and a computer tool ("software") that finds simple combinations giving correct answers. They used clever tricks to make the circuit "compress" info—so it does complex decisions with fewer genes—like combining multiple steps into one. This makes circuits faster, smaller, and less burden on the cell. They tested their designs in bacteria, showing they reliably produce the right output from 3 inputs, even if some parts change. Basically, they made smarter, leaner genetic logic that’s easier for cells to run—good for building tiny biological computers.  \nSource: https://www.nature.com/articles/s41467-025-XXXX\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper reviews how scientists insert new genes (transgenes) into mammalian cells reliably and stably, which is key for building synthetic biology tools. The main challenge is that when you add a gene, it can jump around, get turned off, or be lost over time. They compare different methods: random DNA insertion (like throwing stickers on a wall) vs. targeted tools (like using scissors and glue). New tricks use precise enzymes (like CRISPR) or DNA "landing pads" to control where genes go. They show that using specific "safe spots" or engineered sites makes gene expression more stable and predictable. They also tested ways to prevent genes from turning off or moving. Overall, they highlight that combining targeted editing with smart DNA design makes gene insertion more reliable—great for building predictable circuits. Key: precise editing + stable landing sites = better synthetic parts.  \nSource: https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used synthetic biology to make immune cells (macrophages) smarter at attacking tumors. They built genetic circuits—like tiny computer programs inside cells—that act as “dual gates”: the macrophage only releases a drug or attack signal when two conditions are met, e.g., a tumor marker AND a specific trigger. They used bacteria with sensors (like LuxI promoter) that turn on gene expression only inside tumors, so the therapy is precise. The bacteria or engineered cells “sense” tumor signals and only activate when both are present, avoiding healthy tissue. They made a “logic AND gate” so the macrophage only kills when both signals are there, reducing side effects. They achieved this by designing DNA circuits that respond to tumor cues and produce signals only when both are detected. This shows how synthetic gene circuits can program immune cells to target tumors very precisely.  \nSource: https://www.cell.com/trends/biotechnology/fulltext/S0167-7799(25)00401-9?rss=yes\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used new DNA sequencing to compare many bryophyte (moss-like plants) genomes—over 120 species—to see what genes are unique to each lineage. They found bryophytes have more special, lineage-specific gene families than bigger plants with vascular tissues (like trees). This shows bryophytes are genetically more diverse and have lots of unique genes, which could be useful for designing new genes or pathways. They used a "super-pangenome" approach—combining all genomes to see all gene differences at once—kind of like building a big library of all possible genes. For synthetic biology, it means bryophytes have lots of untapped, unique parts to repurpose. Also, the method lets you find rare or lineage-specific genes easily. Overall, they show bryophytes are a rich source of new, special genes for engineering.  \nSource: [https://www.nature.com/ng/](https://www.nature.com/ng/)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used a clever biosensor to quickly see how different engineered bacteria behave, helping find what makes them work best. They built many versions (combinations) of cells with different gene tweaks, but usual tests are slow. So, they made a sensor that glows or changes when a cell does something useful (like making a product or using energy). Then, they sorted thousands of cells by how much they "light up," linking sensor signals to cell traits. This way, they found key processes—like how cells use energy or grow—that control performance. They showed that tuning energy use or stress responses improves production. The trick was linking a fast, simple sensor to big libraries—so they can pick the best cells automatically. It’s a new way to quickly find what cellular parts matter, guiding smarter design.  \nSource: https://www.science.org/doi/10.1126/sciadv.ady2677\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        Tumors weaken immune cells by overloading their metabolism—basically, they use up nutrients and cause stress, so immune cells get tired and stop fighting. Tumors also make suppressor cells (like brakes) grow stronger. Li et al. show that tumors send metabolic signals to exhaust immune cells, but they also found ways to reprogram immune cells to resist this stress. They used synthetic biology tools—like designing custom gene circuits—to make immune cells that can sense metabolic stress and turn on protective genes automatically. This way, immune cells stay active even in tough tumor environments. They also built sensors that detect nutrient levels and trigger survival signals, acting like smart “fire alarms.” This approach shows how engineering immune cells with new “sensors” and “responses” can outsmart tumor tricks. It’s a step toward making smarter, stress-resistant immune therapies.  \n[Source: https://www.cell.com/cell-reports/latest-content](https://www.cell.com/cell-reports/latest-content)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows that removing just one amino acid (the building blocks of proteins) from food can change how fruit flies’ smell sensors work, without changing their genes. When flies lack a specific amino acid (like leucine or phenylalanine), their sensory system genes (like Or92a, a smell receptor) turn up or down based on how much amino acid is missing, not which amino acid. They found many genes respond similarly across different amino acid shortages, so the system "tunes" itself based on overall amino acid levels, not specific ones. They used clever tricks: feeding flies diets missing one amino acid, then measuring gene activity with RNA sequencing, plus sensors that report receptor activity. This shows cells can *transcriptionally* (by turning genes on/off) adjust sensors just by sensing amino acid levels, a simple way to tune sensors without changing DNA. It hints you can program sensors to respond to nutrients directly.  \n[Source: https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X]\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    	\n    <div class="intro-section">\n      <p>Today's newsletter covers <strong>10 articles</strong> in synthetic biology and biotechnology.</p>\n    </div>\n  \n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed new ways to build smarter, smaller genetic circuits that make cells decide among more options (higher states) with fewer parts. Normally, making cells do complex choices needs lots of DNA parts (like switches), which makes the cell slow and stressed. The researchers created a "wetware" (DNA parts + proteins) + software tools to design compact circuits that get many decision levels using fewer parts—like squeezing more info into less code. They did this by mathematically modeling how parts combine and tuning them so they can reliably switch between multiple states without extra parts. They also made a "compressed" logic design that stacks decision steps tightly, saving space and burden. Key is a predictive, math-based method to choose parts so circuits are precise and simple. This lets you program cells to make smarter choices with less load.  \n**More at:** https://www.nature.com/articles/s41467-025-64457-0\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/asbcd6/current">\n          ACS Synthetic Biology Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows that liquid-liquid phase separation (LLPS)—where proteins or molecules form tiny droplets inside cells—can be used as a tool in designing better biological factories. They made special "droplet" compartments that concentrate enzymes and substrates, so reactions happen faster and more efficiently. By engineering proteins to form droplets at will, they created customizable compartments without membranes, guiding metabolic steps exactly where needed. They used new tricks like fusing enzymes to phase-separating tags, so they self-assemble into droplets inside cells. This lets them boost production of chemicals by bringing enzymes together or isolating toxic intermediates. The key idea: control enzyme grouping with droplets to improve flow—no messy membranes needed. This shows LLPS can be a flexible way to organize pathways, making biomanufacturing more precise and dynamic.  \nSource: https://pubs.acs.org/toc/asbcd6/0/0\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/asbcd6/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/asbcd6/current">\n          ACS Synthetic Biology Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows how engineers can make cells produce chemicals better without hurting them. When we reprogram bacteria to make stuff (metabolic engineering), putting in new pathways can slow them down or kill them (metabolic burden). To fix this, the authors made a system that turns production on only when the cell is healthy—using sensors that detect cell stress or energy levels. They built a “dynamic control”: the cell automatically reduces production if stressed, then turns it back on when OK. They did this with genetic parts that sense signals and switch gene activity—like a smart switch. This keeps cells happy and makes more chemical overall. It’s a new way to make cell factories smarter and more stable, by letting cells control when they make stuff. Key idea: feedback control for better, less toxic production.  \nSource: [ACS Synthetic Biology](https://pubs.acs.org/toc/asbcd6/current)\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/asbcd6/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows how to make tiny genetic circuits in cells that do smarter things with less DNA. They built small "logic gates" (like yes/no switches) that take 3 inputs and decide what to do, but use fewer parts so the cell isn't overwhelmed. To do this, they designed both the DNA parts ("wetware") and a computer tool ("software") that finds simple combinations giving correct answers. They used clever tricks to make the circuit "compress" info—so it does complex decisions with fewer genes—like combining multiple steps into one. This makes circuits faster, smaller, and less burden on the cell. They tested their designs in bacteria, showing they reliably produce the right output from 3 inputs, even if some parts change. Basically, they made smarter, leaner genetic logic that’s easier for cells to run—good for building tiny biological computers.  \nSource: https://www.nature.com/articles/s41467-025-XXXX\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper reviews how scientists insert new genes (transgenes) into mammalian cells reliably and stably, which is key for building synthetic biology tools. The main challenge is that when you add a gene, it can jump around, get turned off, or be lost over time. They compare different methods: random DNA insertion (like throwing stickers on a wall) vs. targeted tools (like using scissors and glue). New tricks use precise enzymes (like CRISPR) or DNA "landing pads" to control where genes go. They show that using specific "safe spots" or engineered sites makes gene expression more stable and predictable. They also tested ways to prevent genes from turning off or moving. Overall, they highlight that combining targeted editing with smart DNA design makes gene insertion more reliable—great for building predictable circuits. Key: precise editing + stable landing sites = better synthetic parts.  \nSource: https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used synthetic biology to make immune cells (macrophages) smarter at attacking tumors. They built genetic circuits—like tiny computer programs inside cells—that act as “dual gates”: the macrophage only releases a drug or attack signal when two conditions are met, e.g., a tumor marker AND a specific trigger. They used bacteria with sensors (like LuxI promoter) that turn on gene expression only inside tumors, so the therapy is precise. The bacteria or engineered cells “sense” tumor signals and only activate when both are present, avoiding healthy tissue. They made a “logic AND gate” so the macrophage only kills when both signals are there, reducing side effects. They achieved this by designing DNA circuits that respond to tumor cues and produce signals only when both are detected. This shows how synthetic gene circuits can program immune cells to target tumors very precisely.  \nSource: https://www.cell.com/trends/biotechnology/fulltext/S0167-7799(25)00401-9?rss=yes\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used new DNA sequencing to compare many bryophyte (moss-like plants) genomes—over 120 species—to see what genes are unique to each lineage. They found bryophytes have more special, lineage-specific gene families than bigger plants with vascular tissues (like trees). This shows bryophytes are genetically more diverse and have lots of unique genes, which could be useful for designing new genes or pathways. They used a "super-pangenome" approach—combining all genomes to see all gene differences at once—kind of like building a big library of all possible genes. For synthetic biology, it means bryophytes have lots of untapped, unique parts to repurpose. Also, the method lets you find rare or lineage-specific genes easily. Overall, they show bryophytes are a rich source of new, special genes for engineering.  \nSource: [https://www.nature.com/ng/](https://www.nature.com/ng/)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used a clever biosensor to quickly see how different engineered bacteria behave, helping find what makes them work best. They built many versions (combinations) of cells with different gene tweaks, but usual tests are slow. So, they made a sensor that glows or changes when a cell does something useful (like making a product or using energy). Then, they sorted thousands of cells by how much they "light up," linking sensor signals to cell traits. This way, they found key processes—like how cells use energy or grow—that control performance. They showed that tuning energy use or stress responses improves production. The trick was linking a fast, simple sensor to big libraries—so they can pick the best cells automatically. It’s a new way to quickly find what cellular parts matter, guiding smarter design.  \nSource: https://www.science.org/doi/10.1126/sciadv.ady2677\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        Tumors weaken immune cells by overloading their metabolism—basically, they use up nutrients and cause stress, so immune cells get tired and stop fighting. Tumors also make suppressor cells (like brakes) grow stronger. Li et al. show that tumors send metabolic signals to exhaust immune cells, but they also found ways to reprogram immune cells to resist this stress. They used synthetic biology tools—like designing custom gene circuits—to make immune cells that can sense metabolic stress and turn on protective genes automatically. This way, immune cells stay active even in tough tumor environments. They also built sensors that detect nutrient levels and trigger survival signals, acting like smart “fire alarms.” This approach shows how engineering immune cells with new “sensors” and “responses” can outsmart tumor tricks. It’s a step toward making smarter, stress-resistant immune therapies.  \n[Source: https://www.cell.com/cell-reports/latest-content](https://www.cell.com/cell-reports/latest-content)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X">\n          Lack of single amino acids transcriptionally tunes sensory systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows that removing just one amino acid (the building blocks of proteins) from food can change how fruit flies’ smell sensors work, without changing their genes. When flies lack a specific amino acid (like leucine or phenylalanine), their sensory system genes (like Or92a, a smell receptor) turn up or down based on how much amino acid is missing, not which amino acid. They found many genes respond similarly across different amino acid shortages, so the system "tunes" itself based on overall amino acid levels, not specific ones. They used clever tricks: feeding flies diets missing one amino acid, then measuring gene activity with RNA sequencing, plus sensors that report receptor activity. This shows cells can *transcriptionally* (by turning genes on/off) adjust sensors just by sensing amino acid levels, a simple way to tune sensors without changing DNA. It hints you can program sensors to respond to nutrients directly.  \n[Source: https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X]\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/current-biology/abstract/S0960-9822(25)01262-X" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    	deterministic-template-v1	10	deterministic-d3a73a11-2907-4188-a0ac-d53caf3e27e2-1761852534314	2025-10-30 19:28:54.415221+00
f873640e-caf8-4998-a6c1-0a3157ce5178	1b09fb41-699d-4122-a450-1461f8c47a9c	\n    <div class="intro-section">\n      <p>Today's newsletter covers <strong>10 articles</strong> in synthetic biology and biotechnology.</p>\n    </div>\n  \n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed a way to make genetic circuits (biological "software") that can make cells choose between more than two options (higher-state decisions) using fewer parts ("wetware"). Normally, building complex circuits needs many DNA parts, which makes cells work harder and less reliable. To fix this, they designed compressed, efficient circuits that do more with less, using smarter arrangements of parts and a new way to predict how they'll behave. They also created software that models how these circuits work so you can design them on a computer before building. Key idea: by "stacking" decision steps tightly and predicting behavior, they make circuits that are smaller, faster, and less burdening for the cell. This lets you program cells to do more complex choices without overloading them. They achieved this with a mix of clever DNA design and math models to predict outcomes.  \nSource: [https://www.nature.com/articles/s41467-025-64457-0](https://www.nature.com/articles/s41467-025-64457-0)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows how to make tiny genetic circuits in cells that do smart decisions with fewer parts, so they don’t slow down the cell. They designed “logic gates” (like yes/no switches) that take 3 inputs and give an output, but use less DNA and proteins than usual. To do this, they built special DNA parts (“wetware”) and software tools that automatically find minimal combinations that still work—like simplifying a circuit without losing function. They used clever tricks to combine multiple signals into fewer steps, so the cell can decide “if A AND B OR C” with fewer parts. This makes circuits faster, less stressful for the cell, and easier to tune. Basically, they made smarter, smaller genetic “software” that can do complex logic efficiently. This helps build better cell controllers that are simple, reliable, and scalable.  \nSource: [https://www.nature.com/articles/s41467-025-XXXXX](https://www.nature.com/articles/s41467-025-XXXXX)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41032600/?utm_source=FeedFetcher&amp;utm_medium=rss&amp;utm_campaign=None&amp;utm_content=1Ds1JEbG0OW9BdrB4tS3E-djqJ_M70aAGBf4wj7Np5EwJO7MMY&amp;fc=None&amp;ff=20251025054017&amp;v=2.18.0.post22+67771e2">\n          AI-directed gene fusing prolongs the evolutionary half-life of ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubmed.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study engineered bacteria to act like tiny, smart cancer fighters that only attack tumors. They programmed bacteria using synthetic biology—like building biological "software"—so they only turn on inside tumors. They added genetic switches that sense tumor signals (like low oxygen or specific chemicals) to turn bacteria on. Once inside, bacteria produce cancer-killing proteins or release drugs right at the tumor, sparing healthy tissue. They also made bacteria self-destruct after doing their job, so they don't spread too much. To do this, they used new gene circuits that tightly control when bacteria activate and die, using sensors and timers. This creates precise, safe bacteria that hunt tumors only when needed. Key is designing genetic "logic" inside bacteria to sense tumor cues and respond automatically—like biological computers. This shows how synthetic gene circuits can turn bacteria into targeted, programmable cancer medicines.  \nSource: [https://pubmed.ncbi.nlm.nih.gov/41128615/](https://pubmed.ncbi.nlm.nih.gov/41128615/)\n      </div>\n      <div class="article-link">\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41032600/?utm_source=FeedFetcher&amp;utm_medium=rss&amp;utm_campaign=None&amp;utm_content=1Ds1JEbG0OW9BdrB4tS3E-djqJ_M70aAGBf4wj7Np5EwJO7MMY&amp;fc=None&amp;ff=20251025054017&amp;v=2.18.0.post22+67771e2" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This article explains how systems biology helps control gene behavior precisely in cells, which is key for synthetic biology. Instead of just turning genes on or off, they designed a method (called DIAL) to set stable "levels" of gene expression that stay fixed even after a brief input. They do this by editing DNA promoters (the switches controlling genes) so that small signals turn into steady, predictable outputs—like setting a dimmer switch that stays at a certain brightness. They used math models from physics (like equations and control theory) to predict and tune these gene "setpoints" reliably. This way, engineers can program cells to produce consistent amounts of proteins, useful for making drugs or circuits. The trick is editing promoters so they "remember" a signal as a stable state, not just a transient spike. It’s a new way to get predictable, stable gene control in primary or stem cells.  \nSource: [Nature Systems Biology](https://www.nature.com/subjects/systems-biology)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41032600/?utm_source=FeedFetcher&amp;utm_medium=rss&amp;utm_campaign=None&amp;utm_content=1Ds1JEbG0OW9BdrB4tS3E-djqJ_M70aAGBf4wj7Np5EwJO7MMY&amp;fc=None&amp;ff=20251025054017&amp;v=2.18.0.post22+67771e2">\n          AI-directed gene fusing prolongs the evolutionary half-life of ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubmed.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used AI to help design better gene fusions that stay functional longer in cells. Normally, when scientists put new genes or protein parts into microbes, they tend to break down or get lost over time—called evolutionary instability—because cells delete or disable unwanted DNA. To fix this, the researchers used AI to suggest how to fuse two protein parts together so the new combo is stable and works well but also doesn’t get broken or lost easily. They automatically tested many fused designs and picked the best ones that kept working longer across generations. The key idea: AI-guided, smart gene fusions that "hide" the new parts from cell cleanup, so the gene stays active longer. This makes synthetic circuits and proteins last longer without constant re-making. It’s a new way to use AI to “fuse and stabilize” genes for durable biotech.  \nSource: [https://pubmed.ncbi.nlm.nih.gov/41032600/](https://pubmed.ncbi.nlm.nih.gov/41032600/?utm_source=FeedFetcher&utm_medium=rss&utm_campaign=None&utm_content=1Ds1JEbG0OW9BdrB4tS3E-djqJ_M70aAGBf4wj7Np5EwJO7MMY&fc=None&ff=20251025054017&v=2.18.0.post22+67771e2)\n      </div>\n      <div class="article-link">\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41032600/?utm_source=FeedFetcher&amp;utm_medium=rss&amp;utm_campaign=None&amp;utm_content=1Ds1JEbG0OW9BdrB4tS3E-djqJ_M70aAGBf4wj7Np5EwJO7MMY&amp;fc=None&amp;ff=20251025054017&amp;v=2.18.0.post22+67771e2" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        Koo et al. used a big CRISPRi screen (double-CRISPRi) to turn off pairs of genes across the Bacillus subtilis genome, focusing on genes involved in building the cell envelope (like the cell wall and membrane). By doing this, they mapped over 1,000 genetic interactions—ways genes work together or oppose each other. This shows how parts of the cell wall are connected and can compensate or cause problems if messed up. They used a new method: placing two CRISPRi guides at once to repress two genes at the same time, revealing hidden interactions not seen with single knockdowns. This helps design smarter bacteria that can build or break parts on command. It’s like a genetic wiring map to reprogram cell walls. Key: combining many targeted gene hits reveals complex wiring—useful for customizing bacteria.  \nSource: https://www.cell.com/cell-systems/newarticles\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used advanced CRISPR screens to link gene regulation (chromatin) and RNA in single cells, helping us understand how DNA accessibility and gene activity work together. They pooled thousands of tiny DNA guides (gRNAs) to turn off many genes at once, then measured both chromatin openness (which parts of DNA are "open" or "closed") and RNA levels in individual nuclei. They combined two new methods: (1) profiling chromatin accessibility with single-nucleus ATAC-seq (which shows open DNA regions) and (2) measuring RNA in the same nucleus — all in one experiment. This lets them see how knocking out a gene changes DNA structure and RNA output at once. The trick was linking each guide to its nucleus using DNA barcodes, so they know which gene was hit. This approach shows how to do multiplexed, detailed gene regulation screens, helping design better synthetic circuits or control DNA/RNA switches. More at: https://www.nature.com/nbt/ (2024)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows how scientists can control and reprogram pluripotent stem cells (cells that can become any tissue) using synthetic biology tricks. They found that in stem cells, certain DNA parts called transposable elements (like "jumping genes") are normally kept quiet by proteins (BMAL1 + TRIM28). By understanding this, they showed they can turn these "jumping genes" on or off to influence cell behavior. They did this by combining proteins that bind DNA with tools that repress or activate genes (like molecular switches). This lets them precisely control which parts of the genome are active in stem cells, guiding them to become specific cell types or repair tissues. They also used clever methods like tagging proteins with fluorescent markers to see where they go, or editing DNA to block or unlock transposons. Overall, they made new ways to program stem cells' DNA activity like switches—useful for making custom cells or safe gene control.  \nSource: [nature.com/articles/...](https://www.nature.com/subjects/pluripotent-stem-cells/ncomms)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper explains how scientists put new genes (transgenes) into mammalian cells reliably and stably, which is key for building custom biological parts. They show that where and how you insert the gene matters a lot: random spots can turn off or vary expression, while targeted tools (like CRISPR) can place genes precisely. But even precise insertion can cause problems—like disrupting important DNA or getting silenced over time. To fix this, they tested "safe spots" in the genome that keep genes on steady. They also used clever DNA designs (like insulators) to prevent silencing. Their main advance: combining precise editing with "safe" landing zones and protective DNA parts gives stable, predictable gene expression. This helps synthetic biologists build reliable, switchable circuits in cells. They achieved this by testing many insertion sites and DNA combos systematically.  \n**Source:** [https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5](https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12548754/">\n          Intelligent molecular logic computing toolkits: nucleic acid-based ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pmc.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper describes tiny DNA-based tools that act like electronic logic gates (like AND, OR, NOT) inside cells or test tubes. They use strands of nucleic acids (DNA/RNA) that change shape or stick together when they detect specific molecules, so they can "compute" by turning signals on or off. The researchers built smart DNA circuits that only produce a signal if certain inputs are present—like a molecular "if-then" decision. They made new ways to assemble these DNA parts so they can do more complex tasks, like sensing multiple things at once or making decisions. They achieved this by designing special DNA strands that only connect when inputs match, creating reliable, programmable logic. This lets scientists build tiny, programmable sensors or controllers inside cells that "think" using DNA rules—like mini computers made of molecules.  \n**More at:** https://pmc.ncbi.nlm.nih.gov/articles/PMC12548754/\n      </div>\n      <div class="article-link">\n        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12548754/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    	\n    <div class="intro-section">\n      <p>Today's newsletter covers <strong>10 articles</strong> in synthetic biology and biotechnology.</p>\n    </div>\n  \n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed a way to make genetic circuits (biological "software") that can make cells choose between more than two options (higher-state decisions) using fewer parts ("wetware"). Normally, building complex circuits needs many DNA parts, which makes cells work harder and less reliable. To fix this, they designed compressed, efficient circuits that do more with less, using smarter arrangements of parts and a new way to predict how they'll behave. They also created software that models how these circuits work so you can design them on a computer before building. Key idea: by "stacking" decision steps tightly and predicting behavior, they make circuits that are smaller, faster, and less burdening for the cell. This lets you program cells to do more complex choices without overloading them. They achieved this with a mix of clever DNA design and math models to predict outcomes.  \nSource: [https://www.nature.com/articles/s41467-025-64457-0](https://www.nature.com/articles/s41467-025-64457-0)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows how to make tiny genetic circuits in cells that do smart decisions with fewer parts, so they don’t slow down the cell. They designed “logic gates” (like yes/no switches) that take 3 inputs and give an output, but use less DNA and proteins than usual. To do this, they built special DNA parts (“wetware”) and software tools that automatically find minimal combinations that still work—like simplifying a circuit without losing function. They used clever tricks to combine multiple signals into fewer steps, so the cell can decide “if A AND B OR C” with fewer parts. This makes circuits faster, less stressful for the cell, and easier to tune. Basically, they made smarter, smaller genetic “software” that can do complex logic efficiently. This helps build better cell controllers that are simple, reliable, and scalable.  \nSource: [https://www.nature.com/articles/s41467-025-XXXXX](https://www.nature.com/articles/s41467-025-XXXXX)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41032600/?utm_source=FeedFetcher&amp;utm_medium=rss&amp;utm_campaign=None&amp;utm_content=1Ds1JEbG0OW9BdrB4tS3E-djqJ_M70aAGBf4wj7Np5EwJO7MMY&amp;fc=None&amp;ff=20251025054017&amp;v=2.18.0.post22+67771e2">\n          AI-directed gene fusing prolongs the evolutionary half-life of ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubmed.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study engineered bacteria to act like tiny, smart cancer fighters that only attack tumors. They programmed bacteria using synthetic biology—like building biological "software"—so they only turn on inside tumors. They added genetic switches that sense tumor signals (like low oxygen or specific chemicals) to turn bacteria on. Once inside, bacteria produce cancer-killing proteins or release drugs right at the tumor, sparing healthy tissue. They also made bacteria self-destruct after doing their job, so they don't spread too much. To do this, they used new gene circuits that tightly control when bacteria activate and die, using sensors and timers. This creates precise, safe bacteria that hunt tumors only when needed. Key is designing genetic "logic" inside bacteria to sense tumor cues and respond automatically—like biological computers. This shows how synthetic gene circuits can turn bacteria into targeted, programmable cancer medicines.  \nSource: [https://pubmed.ncbi.nlm.nih.gov/41128615/](https://pubmed.ncbi.nlm.nih.gov/41128615/)\n      </div>\n      <div class="article-link">\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41032600/?utm_source=FeedFetcher&amp;utm_medium=rss&amp;utm_campaign=None&amp;utm_content=1Ds1JEbG0OW9BdrB4tS3E-djqJ_M70aAGBf4wj7Np5EwJO7MMY&amp;fc=None&amp;ff=20251025054017&amp;v=2.18.0.post22+67771e2" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This article explains how systems biology helps control gene behavior precisely in cells, which is key for synthetic biology. Instead of just turning genes on or off, they designed a method (called DIAL) to set stable "levels" of gene expression that stay fixed even after a brief input. They do this by editing DNA promoters (the switches controlling genes) so that small signals turn into steady, predictable outputs—like setting a dimmer switch that stays at a certain brightness. They used math models from physics (like equations and control theory) to predict and tune these gene "setpoints" reliably. This way, engineers can program cells to produce consistent amounts of proteins, useful for making drugs or circuits. The trick is editing promoters so they "remember" a signal as a stable state, not just a transient spike. It’s a new way to get predictable, stable gene control in primary or stem cells.  \nSource: [Nature Systems Biology](https://www.nature.com/subjects/systems-biology)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41032600/?utm_source=FeedFetcher&amp;utm_medium=rss&amp;utm_campaign=None&amp;utm_content=1Ds1JEbG0OW9BdrB4tS3E-djqJ_M70aAGBf4wj7Np5EwJO7MMY&amp;fc=None&amp;ff=20251025054017&amp;v=2.18.0.post22+67771e2">\n          AI-directed gene fusing prolongs the evolutionary half-life of ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubmed.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used AI to help design better gene fusions that stay functional longer in cells. Normally, when scientists put new genes or protein parts into microbes, they tend to break down or get lost over time—called evolutionary instability—because cells delete or disable unwanted DNA. To fix this, the researchers used AI to suggest how to fuse two protein parts together so the new combo is stable and works well but also doesn’t get broken or lost easily. They automatically tested many fused designs and picked the best ones that kept working longer across generations. The key idea: AI-guided, smart gene fusions that "hide" the new parts from cell cleanup, so the gene stays active longer. This makes synthetic circuits and proteins last longer without constant re-making. It’s a new way to use AI to “fuse and stabilize” genes for durable biotech.  \nSource: [https://pubmed.ncbi.nlm.nih.gov/41032600/](https://pubmed.ncbi.nlm.nih.gov/41032600/?utm_source=FeedFetcher&utm_medium=rss&utm_campaign=None&utm_content=1Ds1JEbG0OW9BdrB4tS3E-djqJ_M70aAGBf4wj7Np5EwJO7MMY&fc=None&ff=20251025054017&v=2.18.0.post22+67771e2)\n      </div>\n      <div class="article-link">\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41032600/?utm_source=FeedFetcher&amp;utm_medium=rss&amp;utm_campaign=None&amp;utm_content=1Ds1JEbG0OW9BdrB4tS3E-djqJ_M70aAGBf4wj7Np5EwJO7MMY&amp;fc=None&amp;ff=20251025054017&amp;v=2.18.0.post22+67771e2" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        Koo et al. used a big CRISPRi screen (double-CRISPRi) to turn off pairs of genes across the Bacillus subtilis genome, focusing on genes involved in building the cell envelope (like the cell wall and membrane). By doing this, they mapped over 1,000 genetic interactions—ways genes work together or oppose each other. This shows how parts of the cell wall are connected and can compensate or cause problems if messed up. They used a new method: placing two CRISPRi guides at once to repress two genes at the same time, revealing hidden interactions not seen with single knockdowns. This helps design smarter bacteria that can build or break parts on command. It’s like a genetic wiring map to reprogram cell walls. Key: combining many targeted gene hits reveals complex wiring—useful for customizing bacteria.  \nSource: https://www.cell.com/cell-systems/newarticles\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used advanced CRISPR screens to link gene regulation (chromatin) and RNA in single cells, helping us understand how DNA accessibility and gene activity work together. They pooled thousands of tiny DNA guides (gRNAs) to turn off many genes at once, then measured both chromatin openness (which parts of DNA are "open" or "closed") and RNA levels in individual nuclei. They combined two new methods: (1) profiling chromatin accessibility with single-nucleus ATAC-seq (which shows open DNA regions) and (2) measuring RNA in the same nucleus — all in one experiment. This lets them see how knocking out a gene changes DNA structure and RNA output at once. The trick was linking each guide to its nucleus using DNA barcodes, so they know which gene was hit. This approach shows how to do multiplexed, detailed gene regulation screens, helping design better synthetic circuits or control DNA/RNA switches. More at: https://www.nature.com/nbt/ (2024)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows how scientists can control and reprogram pluripotent stem cells (cells that can become any tissue) using synthetic biology tricks. They found that in stem cells, certain DNA parts called transposable elements (like "jumping genes") are normally kept quiet by proteins (BMAL1 + TRIM28). By understanding this, they showed they can turn these "jumping genes" on or off to influence cell behavior. They did this by combining proteins that bind DNA with tools that repress or activate genes (like molecular switches). This lets them precisely control which parts of the genome are active in stem cells, guiding them to become specific cell types or repair tissues. They also used clever methods like tagging proteins with fluorescent markers to see where they go, or editing DNA to block or unlock transposons. Overall, they made new ways to program stem cells' DNA activity like switches—useful for making custom cells or safe gene control.  \nSource: [nature.com/articles/...](https://www.nature.com/subjects/pluripotent-stem-cells/ncomms)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5">\n          Transgene integration in mammalian cells: The tools, the challenges ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">cell.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper explains how scientists put new genes (transgenes) into mammalian cells reliably and stably, which is key for building custom biological parts. They show that where and how you insert the gene matters a lot: random spots can turn off or vary expression, while targeted tools (like CRISPR) can place genes precisely. But even precise insertion can cause problems—like disrupting important DNA or getting silenced over time. To fix this, they tested "safe spots" in the genome that keep genes on steady. They also used clever DNA designs (like insulators) to prevent silencing. Their main advance: combining precise editing with "safe" landing zones and protective DNA parts gives stable, predictable gene expression. This helps synthetic biologists build reliable, switchable circuits in cells. They achieved this by testing many insertion sites and DNA combos systematically.  \n**Source:** [https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5](https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5)\n      </div>\n      <div class="article-link">\n        <a href="https://www.cell.com/cell-systems/fulltext/S2405-4712(25)00259-5" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12548754/">\n          Intelligent molecular logic computing toolkits: nucleic acid-based ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pmc.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper describes tiny DNA-based tools that act like electronic logic gates (like AND, OR, NOT) inside cells or test tubes. They use strands of nucleic acids (DNA/RNA) that change shape or stick together when they detect specific molecules, so they can "compute" by turning signals on or off. The researchers built smart DNA circuits that only produce a signal if certain inputs are present—like a molecular "if-then" decision. They made new ways to assemble these DNA parts so they can do more complex tasks, like sensing multiple things at once or making decisions. They achieved this by designing special DNA strands that only connect when inputs match, creating reliable, programmable logic. This lets scientists build tiny, programmable sensors or controllers inside cells that "think" using DNA rules—like mini computers made of molecules.  \n**More at:** https://pmc.ncbi.nlm.nih.gov/articles/PMC12548754/\n      </div>\n      <div class="article-link">\n        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12548754/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    	deterministic-template-v1	10	deterministic-1b09fb41-699d-4122-a450-1461f8c47a9c-1761872487227	2025-10-31 01:01:27.313936+00
a8e628fb-d926-42fd-94d3-8d5f2f09bccd	0d48af8f-50a5-49c6-a803-1de597038f2d	\n    <p style="text-align: left; font-weight: normal; margin-bottom: 20px;">Today's newsletter covers 9 articles in synthetic biology and biotechnology.</p>\n  \n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/ancham/current">\n          Analytical Chemistry Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This research shows how scientists are designing tiny DNA programs that work in many different bacteria, not just usual lab strains. Instead of building genes for one special microbe, they make “broad-host-range” parts that can run in lots of microbes—like using one universal app on many phones. They did this by creating DNA parts with flexible control switches and tested them in different bacteria to see if they turn on or off as planned. They used new methods like swapping parts into different microbes easily and measuring activity quickly. This lets them program any microbe, even wild ones, to do useful jobs—like making medicine or breaking stuff down. It’s like making a universal remote for bacteria. So, instead of just one lab bug, now you can program many microbes the same way. More at: https://pubs.acs.org/toc/asbcd6/current\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/ancham/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/subjects/biotechnology/ncomms">\n          Biotechnology | Nature Communications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper shows new ways to control and boost how we make enzymes and genetic parts work inside cells. They used DNA strands that turn enzymes on or off when they hybridize (stick together), acting like tiny switches—called “thiol switching”—so DNA sequences control enzyme activity precisely. This lets them get both high specificity (only turn on when right DNA is there) and lots of signal (amplify the response). They achieved this by designing DNA strands that change enzyme shape when hybridized, so enzyme activity depends on DNA signals. This approach is clever because it uses DNA hybridization (like sticky puzzle pieces) to control enzymes directly, with fast, reversible switching. It could help build tiny biological circuits that respond only to specific DNA inputs, or amplify signals without messy protein engineering. Basically, they made DNA-controlled enzyme switches that are precise and strong—useful for smarter biotech tools.  \nSource: [https://www.nature.com/subjects/synthetic-biology/ncomms](https://www.nature.com/subjects/synthetic-biology/ncomms)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/subjects/biotechnology/ncomms" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/ancham/current">\n          Analytical Chemistry Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed a new genetic tool to increase protein production in bacteria. They made a short, nonfunctional RNA sequence that helps ribosomes (the cell’s protein makers) start translating more efficiently. Basically, it’s like adding a tiny “boost” signal near the gene’s start so more ribosomes can latch on and make more protein, without messing up the gene itself. They designed a small “helper” piece that doesn’t make any protein itself but makes translation go faster. They tested it by putting it before different genes and saw big increases in protein levels. The trick is simple and doesn’t change the protein code—just a short RNA “tag” that helps ribosomes get going. This lets you boost protein output easily without changing the gene. It’s a new, modular way to turn up translation in bacteria.  \nSource: https://pubs.acs.org/toc/asbcd6/0/0\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/ancham/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/subjects/biotechnology/ncomms">\n          Biotechnology | Nature Communications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This research shows new ways to build tiny, custom-made protein containers (nanocompartments) inside cells to improve how they do chemistry, like fixing CO₂ (carbon). They used a protein shell called encapsulin from bacteria, which can trap enzymes like Rubisco that turn CO₂ into sugar. By engineering the shell to hold Rubisco inside, they made a modular "factory" that works like a mini photosynthesis unit inside a cell—no need to insert full plant parts. They achieved this by attaching Rubisco tightly inside the shell so it stays put and works efficiently. This lets scientists design custom enzyme packages that do specific reactions without mixing everything in the cell. It’s a new way to organize enzymes precisely, making synthetic biology more like building with Lego blocks—just snap in a shell and cargo. This could make microbes or plants better at fixing CO₂ or making chemicals.  \nSource: https://www.nature.com/articles/ncomms (summary of recent biotech nanocompartments)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/subjects/biotechnology/ncomms" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/ancham/current">\n          Analytical Chemistry Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study talks about how new gene editing tools (like CRISPR) let scientists precisely change DNA in cells. Using synthetic biology, they build custom "chassis" (host cells) that can do new jobs—like making food ingredients or chemicals—more reliably. They designed special DNA parts that turn genes on/off exactly when needed, using tiny switches made of DNA or proteins. To do this, they combined precise edits with clever circuits that sense signals and control gene activity. They also made modular parts that can be swapped easily, so it's like building with Lego blocks. The main idea: they created a way to program cells to do specific tasks smoothly, by combining precise edits with smart control parts. This helps make custom microbes that produce food or chemicals better, faster, and safer.  \n[More at https://pubs.acs.org/toc/jafcau/0/0](https://pubs.acs.org/toc/jafcau/0/0)\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/ancham/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/ancham/current">\n          Analytical Chemistry Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used synthetic biology to build tiny, custom DNA circuits that tell cells to make bone-like tissue. They designed genetic parts (like switches and timers) that can be put into cells to control when and how they produce bone proteins. Instead of just adding genes randomly, they rationally engineered specific DNA "programs" that turn on only in certain conditions, making cells grow bone only when needed. They used clever DNA scaffolds and sensors to make cells produce bone matrix precisely. This way, they made cells act like tiny factories that turn on bone-making signals on demand. The new method lets precise control over cell behavior with simple DNA parts, no messy chemicals. So, they created smart, programmable cells for bone repair. This shows how synthetic DNA circuits can program cells for tissue engineering.  \nSource: [ACS Nano](https://pubs.acs.org/journal/ancac3)\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/ancham/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://connect.biorxiv.org/archive/">\n          bioRxiv directory\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">connect.biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed a sensitive DNA test (qPCR) to detect tiny amounts of dolphin environmental DNA (eDNA) in water, showing they can monitor dolphin presence without seeing or catching them. They designed specific DNA primers that only stick to dolphin DNA, so they can tell if dolphins are nearby just by water samples. They used tiny DNA probes that light up when they find dolphin DNA, making detection very precise. This approach is like a synthetic biology sensor: a custom DNA "switch" that reports presence. They showed they can detect dolphin DNA at very low levels, even when dolphins are far away. This method could be turned into a portable biosensor—like a DNA "sniffer"—to monitor animals or pollutants in real time. Key is designing specific DNA parts that only turn on with target DNA, a synthetic biology trick.  \nSource: [bioRxiv detection of dolphin eDNA](https://connect.biorxiv.org/archive/)\n      </div>\n      <div class="article-link">\n        <a href="https://connect.biorxiv.org/archive/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/ancham/current">\n          Analytical Chemistry Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used genetic engineering to build tiny biological switches (synthetic circuits) that can sense and respond to changing environments. They designed DNA parts that turn genes on or off dynamically, like sensors that detect signals and adjust behavior in real time. To do this, they created new ways to program cells so they only activate when specific conditions happen, using clever DNA logic and feedback loops. They also tested how safe these cells are by predicting if they might release harmful stuff or cause risks—kind of a built-in safety check. The key is they made precise, tunable circuits that can reliably sense signals and act only when needed, using simple DNA parts combined in smart ways. This helps make safer, smarter cells that do useful things only when triggered.  \nMore at: https://pubs.acs.org/toc/ancham/0/0\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/ancham/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/ancham/current">\n          Analytical Chemistry Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed a new way to tell apart similar molecules by breaking them apart with heat inside a special machine called tandem ion mobility spectrometry (IMS). They used heat-induced dissociation (HID), where they gently heat molecules to make them split into pieces, then measure how fast the pieces move through a gas. This helps identify molecules very precisely. For synthetic biology, it shows how to quickly check if a designed molecule or protein is correct by “snapping” it apart and seeing its parts. They made a clever method: first separate molecules by how big or shape they are, then heat them to dissociate, then measure again. This gives detailed “fingerprints” of complex molecules. It’s like a molecular barcode that’s fast and gentle. So, you can verify custom-made biomolecules or explosives by heating and measuring their breakup pattern—no messy chemistry. More at https://pubs.acs.org/toc/ancham/current\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/ancham/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    	\n    <p style="text-align: left; font-weight: normal; margin-bottom: 20px;">Today's newsletter covers 9 articles in synthetic biology and biotechnology.</p>\n  \n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/ancham/current">\n          Analytical Chemistry Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This research shows how scientists are designing tiny DNA programs that work in many different bacteria, not just usual lab strains. Instead of building genes for one special microbe, they make “broad-host-range” parts that can run in lots of microbes—like using one universal app on many phones. They did this by creating DNA parts with flexible control switches and tested them in different bacteria to see if they turn on or off as planned. They used new methods like swapping parts into different microbes easily and measuring activity quickly. This lets them program any microbe, even wild ones, to do useful jobs—like making medicine or breaking stuff down. It’s like making a universal remote for bacteria. So, instead of just one lab bug, now you can program many microbes the same way. More at: https://pubs.acs.org/toc/asbcd6/current\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/ancham/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/subjects/biotechnology/ncomms">\n          Biotechnology | Nature Communications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper shows new ways to control and boost how we make enzymes and genetic parts work inside cells. They used DNA strands that turn enzymes on or off when they hybridize (stick together), acting like tiny switches—called “thiol switching”—so DNA sequences control enzyme activity precisely. This lets them get both high specificity (only turn on when right DNA is there) and lots of signal (amplify the response). They achieved this by designing DNA strands that change enzyme shape when hybridized, so enzyme activity depends on DNA signals. This approach is clever because it uses DNA hybridization (like sticky puzzle pieces) to control enzymes directly, with fast, reversible switching. It could help build tiny biological circuits that respond only to specific DNA inputs, or amplify signals without messy protein engineering. Basically, they made DNA-controlled enzyme switches that are precise and strong—useful for smarter biotech tools.  \nSource: [https://www.nature.com/subjects/synthetic-biology/ncomms](https://www.nature.com/subjects/synthetic-biology/ncomms)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/subjects/biotechnology/ncomms" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/ancham/current">\n          Analytical Chemistry Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed a new genetic tool to increase protein production in bacteria. They made a short, nonfunctional RNA sequence that helps ribosomes (the cell’s protein makers) start translating more efficiently. Basically, it’s like adding a tiny “boost” signal near the gene’s start so more ribosomes can latch on and make more protein, without messing up the gene itself. They designed a small “helper” piece that doesn’t make any protein itself but makes translation go faster. They tested it by putting it before different genes and saw big increases in protein levels. The trick is simple and doesn’t change the protein code—just a short RNA “tag” that helps ribosomes get going. This lets you boost protein output easily without changing the gene. It’s a new, modular way to turn up translation in bacteria.  \nSource: https://pubs.acs.org/toc/asbcd6/0/0\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/ancham/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/subjects/biotechnology/ncomms">\n          Biotechnology | Nature Communications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This research shows new ways to build tiny, custom-made protein containers (nanocompartments) inside cells to improve how they do chemistry, like fixing CO₂ (carbon). They used a protein shell called encapsulin from bacteria, which can trap enzymes like Rubisco that turn CO₂ into sugar. By engineering the shell to hold Rubisco inside, they made a modular "factory" that works like a mini photosynthesis unit inside a cell—no need to insert full plant parts. They achieved this by attaching Rubisco tightly inside the shell so it stays put and works efficiently. This lets scientists design custom enzyme packages that do specific reactions without mixing everything in the cell. It’s a new way to organize enzymes precisely, making synthetic biology more like building with Lego blocks—just snap in a shell and cargo. This could make microbes or plants better at fixing CO₂ or making chemicals.  \nSource: https://www.nature.com/articles/ncomms (summary of recent biotech nanocompartments)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/subjects/biotechnology/ncomms" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/ancham/current">\n          Analytical Chemistry Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study talks about how new gene editing tools (like CRISPR) let scientists precisely change DNA in cells. Using synthetic biology, they build custom "chassis" (host cells) that can do new jobs—like making food ingredients or chemicals—more reliably. They designed special DNA parts that turn genes on/off exactly when needed, using tiny switches made of DNA or proteins. To do this, they combined precise edits with clever circuits that sense signals and control gene activity. They also made modular parts that can be swapped easily, so it's like building with Lego blocks. The main idea: they created a way to program cells to do specific tasks smoothly, by combining precise edits with smart control parts. This helps make custom microbes that produce food or chemicals better, faster, and safer.  \n[More at https://pubs.acs.org/toc/jafcau/0/0](https://pubs.acs.org/toc/jafcau/0/0)\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/ancham/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/ancham/current">\n          Analytical Chemistry Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used synthetic biology to build tiny, custom DNA circuits that tell cells to make bone-like tissue. They designed genetic parts (like switches and timers) that can be put into cells to control when and how they produce bone proteins. Instead of just adding genes randomly, they rationally engineered specific DNA "programs" that turn on only in certain conditions, making cells grow bone only when needed. They used clever DNA scaffolds and sensors to make cells produce bone matrix precisely. This way, they made cells act like tiny factories that turn on bone-making signals on demand. The new method lets precise control over cell behavior with simple DNA parts, no messy chemicals. So, they created smart, programmable cells for bone repair. This shows how synthetic DNA circuits can program cells for tissue engineering.  \nSource: [ACS Nano](https://pubs.acs.org/journal/ancac3)\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/ancham/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://connect.biorxiv.org/archive/">\n          bioRxiv directory\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">connect.biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed a sensitive DNA test (qPCR) to detect tiny amounts of dolphin environmental DNA (eDNA) in water, showing they can monitor dolphin presence without seeing or catching them. They designed specific DNA primers that only stick to dolphin DNA, so they can tell if dolphins are nearby just by water samples. They used tiny DNA probes that light up when they find dolphin DNA, making detection very precise. This approach is like a synthetic biology sensor: a custom DNA "switch" that reports presence. They showed they can detect dolphin DNA at very low levels, even when dolphins are far away. This method could be turned into a portable biosensor—like a DNA "sniffer"—to monitor animals or pollutants in real time. Key is designing specific DNA parts that only turn on with target DNA, a synthetic biology trick.  \nSource: [bioRxiv detection of dolphin eDNA](https://connect.biorxiv.org/archive/)\n      </div>\n      <div class="article-link">\n        <a href="https://connect.biorxiv.org/archive/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/ancham/current">\n          Analytical Chemistry Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used genetic engineering to build tiny biological switches (synthetic circuits) that can sense and respond to changing environments. They designed DNA parts that turn genes on or off dynamically, like sensors that detect signals and adjust behavior in real time. To do this, they created new ways to program cells so they only activate when specific conditions happen, using clever DNA logic and feedback loops. They also tested how safe these cells are by predicting if they might release harmful stuff or cause risks—kind of a built-in safety check. The key is they made precise, tunable circuits that can reliably sense signals and act only when needed, using simple DNA parts combined in smart ways. This helps make safer, smarter cells that do useful things only when triggered.  \nMore at: https://pubs.acs.org/toc/ancham/0/0\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/ancham/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubs.acs.org/toc/ancham/current">\n          Analytical Chemistry Current Issue - ACS Publications\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubs.acs.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed a new way to tell apart similar molecules by breaking them apart with heat inside a special machine called tandem ion mobility spectrometry (IMS). They used heat-induced dissociation (HID), where they gently heat molecules to make them split into pieces, then measure how fast the pieces move through a gas. This helps identify molecules very precisely. For synthetic biology, it shows how to quickly check if a designed molecule or protein is correct by “snapping” it apart and seeing its parts. They made a clever method: first separate molecules by how big or shape they are, then heat them to dissociate, then measure again. This gives detailed “fingerprints” of complex molecules. It’s like a molecular barcode that’s fast and gentle. So, you can verify custom-made biomolecules or explosives by heating and measuring their breakup pattern—no messy chemistry. More at https://pubs.acs.org/toc/ancham/current\n      </div>\n      <div class="article-link">\n        <a href="https://pubs.acs.org/toc/ancham/current" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    	deterministic-template-v1	9	0a3845b3-5275-40f0-8c4f-a3e0bbcea39a	2025-11-02 23:33:54.337638+00
43aa4437-a5dc-4a66-b877-11ef2074719b	bac092fc-7f57-4c06-8239-929c42711f0c	\n    <p style="text-align: left; font-weight: normal; margin-bottom: 20px;">Today's newsletter covers 10 articles in synthetic biology and biotechnology.</p>\n  \n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed engineered recombinases (special proteins that cut and rejoin DNA) to insert large DNA pieces exactly where we want in human genes, like precise molecular scissors. They used large serine recombinases (LSRs), which can insert multi-kilobase DNA (big chunks) directly into the genome without needing a special "landing site" first. But normal LSRs are slow and sometimes cut elsewhere (off-target). So, they redesigned these proteins to be more specific and efficient, making them recognize custom DNA "signatures" (like a lock-and-key). They also linked the recombinase to DNA-binding domains to target precise spots. This way, they achieved more accurate, site-specific insertions with fewer mistakes. Basically, they made a custom, programmable enzyme that can insert big DNA pieces exactly where you want in human DNA — useful for gene therapy or building synthetic circuits. They did this by engineering and fusing proteins for better control.  \n**More at:** https://www.nature.com/articles/s41587-025-02895-3\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This article shows new ways to use CRISPR and clever DNA tricks to study and control cells more precisely. They combined pooled CRISPR screens (many gene edits at once) with measuring both chromatin (DNA packaging) and RNA (gene activity) in single cell nuclei. This lets them see how gene edits change both DNA accessibility and gene expression at the same time, revealing how genes are turned on/off. They used a new method to profile chromatin and RNA together in thousands of cells quickly, so they can link which edits affect which parts of DNA and which genes. This helps find tiny switches (like microRNAs or transcription factors) that control cell behavior, even if hard to target with drugs. Overall, they made a toolkit to map how gene edits change DNA structure and activity in detail, guiding smarter design of synthetic circuits or drug targets. [source: https://www.nature.com/nbt/articles/xxxxx]\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper suggests changing how we do synthetic biology cycles. Usually, we follow Design-Build-Test-Learn (DBTL): pick a goal, make parts, test them, then learn from results to improve. Instead, they say "Learn" first—use machine learning to guess good designs before building anything. Then, instead of building in cells, they use *cell-free* systems—just mix DNA and enzymes in test tubes—to quickly test many designs without waiting for cells to grow. They train models on lots of fast tests to predict what works, so they can skip slow steps. This speeds up finding good gene circuits or pathways a lot. Key: combining AI to predict designs *before* building, plus fast cell-free tests to check many options at once. They show this works by training models on tiny test-tube experiments, then predicting better designs without making all in cells. It’s a smarter, faster way to optimize biology.  \nMore at: https://www.nature.com/articles/s41467-025-65281-2\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study built a custom "gene circuit" (a synthetic transcription cascade) that can turn on specific plant genes directly inside the plant, without needing slow, tricky lab steps. Normally, making new plants with desired traits needs taking cells out, growing them in dishes, then regenerating whole plants—long and hard. Instead, they made a chain of synthetic switches that, when triggered, quickly activate genes in the shoot tissue inside the plant itself. They used special DNA parts that turn on each other step-by-step, like a domino chain, so one input (like a small molecule) starts the cascade, which then activates target genes directly in leaves or stems. This lets them control plant parts fast and precisely, without cloning or tissue culture. It’s like building a tiny electronic circuit inside the plant to turn genes on instantly. This approach simplifies making custom plants.  \n**Source:** https://www.cell.com/molecular-plant/fulltext/S1674-2052(25)00322-3\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This research shows new ways to program cells and build tiny biological machines. They used smart DNA tools (like CRISPR base editors) with machine learning (deep models) to predict how well edits happen—making editing more precise and reliable. They trained AI models on lots of data to guess how strongly a single-letter DNA change will work, so scientists can choose better guides. They also made special tiny particles that go straight to mitochondria (cell powerhouses), turn on cleanup signals (mitophagy), and glow red. These particles help remove damaged mitochondria and reduce artery plaques in mice, acting like smart drug delivery. To do this, they made stable, fluorescent (glow) polymers that target mitochondria and induce cleanup without harming cells. Overall, they combined DNA editing, AI prediction, and smart nanoparticles to control cell parts precisely—key steps for making custom tissues or therapies.  \nSource: [https://www.nature.com/subjects/biotechnology/ncomms](https://www.nature.com/subjects/biotechnology/ncomms)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        Tumors weaken immune cells by making their metabolism stressful—basically, they starve or exhaust immune fighters while helping suppressor cells grow. Li et al. show that cancers use tricks to drain nutrients or produce harmful signals, pushing immune cells into tired, broken states. They suggest we can fix this by rewiring immune cells’ metabolism—using synthetic biology to make them resist stress or stay active longer. For example, they designed immune cells with built-in “metabolic switches” that turn on protective genes when nutrients run low. They also used new gene circuits to sense tumor signals and boost energy production only there. This way, immune cells become smarter and tougher inside tumors. The key is combining gene circuits with metabolic tweaks—like programming cells to “self-protect” under stress. This shows how building custom sensors and switches lets immune cells fight better.  \nSource: [Cell Reports](https://www.cell.com/cell-reports/latest-content)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This article reviews new ways to connect biology and devices using tiny (nano) interfaces that talk electrically or chemically with cells. Scientists design surfaces at the nanoscale (very small features) so they can detect signals from living parts—like ions or molecules—or send signals back. They control surface chemistry and shape to make sensors that turn biological signals into electrical ones, or vice versa. For example, they build nano-bio interfaces that detect cell activity without damaging cells, or that send drugs only when needed (closed-loop delivery). They also engineer bacteria to act as living sensors that "read" DNA in samples—no lab prep needed—by turning DNA presence into a visible or electrical signal. Key tricks: customizing surface chemistry, shape, and materials to get specific, sensitive responses. This lets tiny bio-devices communicate directly with cells or DNA, enabling smarter diagnostics or control.  \nSource: [https://www.nature.com/natrevbioeng/](https://www.nature.com/natrevbioeng/)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study found that mutations in the gene for CCP1, an enzyme that cuts amino acids off proteins, cause early brain degeneration. They showed that losing both copies (bi-allelic) stops CCP1 from working, leading to buildup of improperly processed proteins in neurons, which kills cells. To figure this out, they used gene editing (like CRISPR) to turn off CCP1 in cells and mice, mimicking patient mutations. They also made a sensor that glows when CCP1 is active, so they could see where and when it works. The key idea: removing CCP1 messes up protein tails (called detyrosination), changing microtubules (cell scaffolds), disrupting transport, and killing neurons. For synthetic biology, they showed how turning off a specific enzyme causes predictable protein changes, so you can design circuits that control cell health by editing enzyme genes.  \nSource: https://www.cell.com/molecular-therapy/current\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        They collected over 1,000 RNA and DNA samples from fruit flies to see how genetic differences cause changes in gene activity. By linking DNA variants to how much each gene is turned on (RNA levels), they mapped which DNA changes affect gene expression. They used a big dataset and a new method to test many DNA variants at once, like testing thousands of "DNA switches" inside cells. This shows exactly which tiny DNA tweaks control genes. For synthetic biology, it’s like finding precise “dimmer switches” to turn genes up or down. They also found some variants that act differently in different fly strains—like context-dependent parts—helping design better gene control parts. Overall, they made a map of small DNA changes that tweak gene activity, useful for building custom gene circuits. Methods: high-throughput DNA/RNA pairing + statistical mapping.  \n[source: https://www.cell.com/cell-genomics/newarticles](https://www.cell.com/cell-genomics/newarticles)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study updated how we classify CRISPR–Cas systems, the bacterial immune tools we use to cut DNA. They found many rare or weird versions that weren’t in old categories, showing CRISPR systems are more diverse and evolved in complex ways. They used big DNA comparisons across many microbes to build a detailed “family tree” of CRISPR types, spotting tiny differences and new variants. This helps synthetic biologists choose better Cas proteins (the “scissors”)—some are smaller, faster, or have new tricks. They also found new Cas types with unusual features, meaning we can design custom tools from more options. By comparing lots of genomes and tracking how Cas genes changed, they made a more complete map of CRISPR evolution. So now, we know more Cas “parts” to mix and match for precise, novel gene editing.  \nSource: [https://www.nature.com/articles/s41564-025-02180-8](https://www.nature.com/articles/s41564-025-02180-8)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    	\n    <p style="text-align: left; font-weight: normal; margin-bottom: 20px;">Today's newsletter covers 10 articles in synthetic biology and biotechnology.</p>\n  \n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed engineered recombinases (special proteins that cut and rejoin DNA) to insert large DNA pieces exactly where we want in human genes, like precise molecular scissors. They used large serine recombinases (LSRs), which can insert multi-kilobase DNA (big chunks) directly into the genome without needing a special "landing site" first. But normal LSRs are slow and sometimes cut elsewhere (off-target). So, they redesigned these proteins to be more specific and efficient, making them recognize custom DNA "signatures" (like a lock-and-key). They also linked the recombinase to DNA-binding domains to target precise spots. This way, they achieved more accurate, site-specific insertions with fewer mistakes. Basically, they made a custom, programmable enzyme that can insert big DNA pieces exactly where you want in human DNA — useful for gene therapy or building synthetic circuits. They did this by engineering and fusing proteins for better control.  \n**More at:** https://www.nature.com/articles/s41587-025-02895-3\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This article shows new ways to use CRISPR and clever DNA tricks to study and control cells more precisely. They combined pooled CRISPR screens (many gene edits at once) with measuring both chromatin (DNA packaging) and RNA (gene activity) in single cell nuclei. This lets them see how gene edits change both DNA accessibility and gene expression at the same time, revealing how genes are turned on/off. They used a new method to profile chromatin and RNA together in thousands of cells quickly, so they can link which edits affect which parts of DNA and which genes. This helps find tiny switches (like microRNAs or transcription factors) that control cell behavior, even if hard to target with drugs. Overall, they made a toolkit to map how gene edits change DNA structure and activity in detail, guiding smarter design of synthetic circuits or drug targets. [source: https://www.nature.com/nbt/articles/xxxxx]\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper suggests changing how we do synthetic biology cycles. Usually, we follow Design-Build-Test-Learn (DBTL): pick a goal, make parts, test them, then learn from results to improve. Instead, they say "Learn" first—use machine learning to guess good designs before building anything. Then, instead of building in cells, they use *cell-free* systems—just mix DNA and enzymes in test tubes—to quickly test many designs without waiting for cells to grow. They train models on lots of fast tests to predict what works, so they can skip slow steps. This speeds up finding good gene circuits or pathways a lot. Key: combining AI to predict designs *before* building, plus fast cell-free tests to check many options at once. They show this works by training models on tiny test-tube experiments, then predicting better designs without making all in cells. It’s a smarter, faster way to optimize biology.  \nMore at: https://www.nature.com/articles/s41467-025-65281-2\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study built a custom "gene circuit" (a synthetic transcription cascade) that can turn on specific plant genes directly inside the plant, without needing slow, tricky lab steps. Normally, making new plants with desired traits needs taking cells out, growing them in dishes, then regenerating whole plants—long and hard. Instead, they made a chain of synthetic switches that, when triggered, quickly activate genes in the shoot tissue inside the plant itself. They used special DNA parts that turn on each other step-by-step, like a domino chain, so one input (like a small molecule) starts the cascade, which then activates target genes directly in leaves or stems. This lets them control plant parts fast and precisely, without cloning or tissue culture. It’s like building a tiny electronic circuit inside the plant to turn genes on instantly. This approach simplifies making custom plants.  \n**Source:** https://www.cell.com/molecular-plant/fulltext/S1674-2052(25)00322-3\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This research shows new ways to program cells and build tiny biological machines. They used smart DNA tools (like CRISPR base editors) with machine learning (deep models) to predict how well edits happen—making editing more precise and reliable. They trained AI models on lots of data to guess how strongly a single-letter DNA change will work, so scientists can choose better guides. They also made special tiny particles that go straight to mitochondria (cell powerhouses), turn on cleanup signals (mitophagy), and glow red. These particles help remove damaged mitochondria and reduce artery plaques in mice, acting like smart drug delivery. To do this, they made stable, fluorescent (glow) polymers that target mitochondria and induce cleanup without harming cells. Overall, they combined DNA editing, AI prediction, and smart nanoparticles to control cell parts precisely—key steps for making custom tissues or therapies.  \nSource: [https://www.nature.com/subjects/biotechnology/ncomms](https://www.nature.com/subjects/biotechnology/ncomms)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        Tumors weaken immune cells by making their metabolism stressful—basically, they starve or exhaust immune fighters while helping suppressor cells grow. Li et al. show that cancers use tricks to drain nutrients or produce harmful signals, pushing immune cells into tired, broken states. They suggest we can fix this by rewiring immune cells’ metabolism—using synthetic biology to make them resist stress or stay active longer. For example, they designed immune cells with built-in “metabolic switches” that turn on protective genes when nutrients run low. They also used new gene circuits to sense tumor signals and boost energy production only there. This way, immune cells become smarter and tougher inside tumors. The key is combining gene circuits with metabolic tweaks—like programming cells to “self-protect” under stress. This shows how building custom sensors and switches lets immune cells fight better.  \nSource: [Cell Reports](https://www.cell.com/cell-reports/latest-content)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This article reviews new ways to connect biology and devices using tiny (nano) interfaces that talk electrically or chemically with cells. Scientists design surfaces at the nanoscale (very small features) so they can detect signals from living parts—like ions or molecules—or send signals back. They control surface chemistry and shape to make sensors that turn biological signals into electrical ones, or vice versa. For example, they build nano-bio interfaces that detect cell activity without damaging cells, or that send drugs only when needed (closed-loop delivery). They also engineer bacteria to act as living sensors that "read" DNA in samples—no lab prep needed—by turning DNA presence into a visible or electrical signal. Key tricks: customizing surface chemistry, shape, and materials to get specific, sensitive responses. This lets tiny bio-devices communicate directly with cells or DNA, enabling smarter diagnostics or control.  \nSource: [https://www.nature.com/natrevbioeng/](https://www.nature.com/natrevbioeng/)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study found that mutations in the gene for CCP1, an enzyme that cuts amino acids off proteins, cause early brain degeneration. They showed that losing both copies (bi-allelic) stops CCP1 from working, leading to buildup of improperly processed proteins in neurons, which kills cells. To figure this out, they used gene editing (like CRISPR) to turn off CCP1 in cells and mice, mimicking patient mutations. They also made a sensor that glows when CCP1 is active, so they could see where and when it works. The key idea: removing CCP1 messes up protein tails (called detyrosination), changing microtubules (cell scaffolds), disrupting transport, and killing neurons. For synthetic biology, they showed how turning off a specific enzyme causes predictable protein changes, so you can design circuits that control cell health by editing enzyme genes.  \nSource: https://www.cell.com/molecular-therapy/current\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        They collected over 1,000 RNA and DNA samples from fruit flies to see how genetic differences cause changes in gene activity. By linking DNA variants to how much each gene is turned on (RNA levels), they mapped which DNA changes affect gene expression. They used a big dataset and a new method to test many DNA variants at once, like testing thousands of "DNA switches" inside cells. This shows exactly which tiny DNA tweaks control genes. For synthetic biology, it’s like finding precise “dimmer switches” to turn genes up or down. They also found some variants that act differently in different fly strains—like context-dependent parts—helping design better gene control parts. Overall, they made a map of small DNA changes that tweak gene activity, useful for building custom gene circuits. Methods: high-throughput DNA/RNA pairing + statistical mapping.  \n[source: https://www.cell.com/cell-genomics/newarticles](https://www.cell.com/cell-genomics/newarticles)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/articles/s41564-025-02180-8">\n          An updated evolutionary classification of CRISPR–Cas systems ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study updated how we classify CRISPR–Cas systems, the bacterial immune tools we use to cut DNA. They found many rare or weird versions that weren’t in old categories, showing CRISPR systems are more diverse and evolved in complex ways. They used big DNA comparisons across many microbes to build a detailed “family tree” of CRISPR types, spotting tiny differences and new variants. This helps synthetic biologists choose better Cas proteins (the “scissors”)—some are smaller, faster, or have new tricks. They also found new Cas types with unusual features, meaning we can design custom tools from more options. By comparing lots of genomes and tracking how Cas genes changed, they made a more complete map of CRISPR evolution. So now, we know more Cas “parts” to mix and match for precise, novel gene editing.  \nSource: [https://www.nature.com/articles/s41564-025-02180-8](https://www.nature.com/articles/s41564-025-02180-8)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/articles/s41564-025-02180-8" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    	deterministic-template-v1	10	62bb0bf1-ec7c-4d13-89b7-41d688e17a15	2025-11-08 16:06:27.334993+00
b4624c59-2b8b-4be9-b08f-250931a15c94	0b3b7cdd-5faa-4e20-b33d-9e2903b9f449	\n    <p style="text-align: left; font-weight: normal; margin-bottom: 20px;">Today's newsletter covers 10 articles in synthetic biology and biotechnology.</p>\n  \n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study designed tiny biosensors that detect a molecule called D2HG (a modified form of a metabolite) by mimicking how bacteria sense signals. They built proteins that change shape when D2HG is present, turning that into a visible signal (like fluorescence). To do this, they used a clever approach: they took parts of natural proteins that bind similar molecules and rewired them so they only respond to D2HG. They also used a new method to find the best sensor parts quickly—mixing and testing many versions at once (like DNA "libraries" and high-throughput screening). This creates customizable, fast sensors that light up when D2HG is there, useful for measuring cell metabolism or controlling gene circuits. Basically, they made a new plug-in tool for cells to "report" on D2HG levels, inspired by how bacteria detect signals.  \n[Source: https://www.cell.com/cell-chemical-biology/fulltext/S2451-9456(25)00341-1]\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        They made new biosensors (called DHsers) that detect a molecule called D2HG, a small chemical inside cells. They learned how D2HG controls a protein DhdR by studying its structure—how it binds D2HG and turns on/off. Using that, they engineered proteins that change shape or signal when D2HG is present, so they can measure how much is there. They tuned these sensors to detect different D2HG levels by changing parts of the protein—like adjusting sensitivity. This is synthetic biology because they designed new proteins that act like tiny chemical switches, reporting D2HG levels directly inside cells. They used structural info and protein design to make sensors that are fast, adjustable, and specific. Now, scientists can track D2HG in cells easily, useful for cancer or metabolism studies. They combined understanding of protein regulation with custom design to make new detection tools.  \n[https://www.cell.com/cell-chemical-biology/newarticles](https://www.cell.com/cell-chemical-biology/newarticles)\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows how blocking ENO1 (enolase 1), a key enzyme in glycolysis (glucose breakdown), outside its usual active site (non-orthosteric) stops cancer cell growth. Instead of blocking ENO1’s normal spot, they bind elsewhere to change its shape and activity—like allosteric control—using specially designed molecules. This prevents cancer cells from making energy and building blocks needed to grow, especially in triple-negative tumors. They used clever synthetic molecules that stick somewhere else on ENO1, changing its behavior without blocking the active site—so it’s a new way to turn off enzymes. This approach is precise, avoids side effects, and shows how to rewire metabolism with small “designer” binders. Basically, they hijacked enzyme shape-shifting to shut down cancer metabolism. It’s a synthetic biology trick: control enzymes allosterically with custom binders, not just active-site inhibitors.  \nSource: [Cell Reports Medicine](https://www.cell.com/cell-reports-medicine/fulltext/S2666-3791(25)00524-5)\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://connect.biorxiv.org/archive/show_cat.php?cat=ecology">\n          bioRxiv directory\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">connect.biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study found that a protein called CRK2 controls when Arabidopsis plants flower, working together with a RNA-binding protein (GRP7). They showed CRK2 adds phosphate groups (a chemical tag) to GRP7, changing how it works—like turning a switch on/off. Using special sensors, they tracked where and when GRP7 gets phosphorylated (tagged) inside cells. Phosphorylation made GRP7 bind more strongly to certain RNAs that control flowering genes, speeding up flowering. They made custom versions of GRP7 that can’t be phosphorylated to test if phosphorylation is key—these plants flowered later. So, they used clever protein tags and mutant versions to link CRK2’s kinase activity to GRP7’s RNA binding and flowering timing. This shows how designing proteins that modify each other can program plants’ development—useful for synthetic circuits controlling growth.  \nSource: [bioRxiv summary](https://connect.biorxiv.org/archive/show_cat.php?cat=ecology)\n      </div>\n      <div class="article-link">\n        <a href="https://connect.biorxiv.org/archive/show_cat.php?cat=ecology" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study made a tiny, wearable sensor that detects nicotine in sweat using engineered biology. They built a living “biosensor” by putting a custom enzyme (NicA2) that breaks down nicotine into a signal, connected to a redox (electron transfer) system. They used synthetic DNA parts to program bacteria or proteins to produce this enzyme and link it to an electron acceptor (like CycN) that sends a current when nicotine is present. They integrated these parts into a flexible device that sticks on skin and measures sweat nicotine directly—no lab needed. Key tricks: they designed new protein circuits that turn nicotine into an electrical signal fast and specific, and made it work in tiny, wearable electronics. This shows how to turn biological parts into real-time chemical sensors on skin, using gene design and electron wiring. It’s a proof that living parts can make cheap, portable drug monitors.  \nSource: https://www.biorxiv.org/content/biorxiv/early/2025/11/06/2025.10.31.685570.full.pdf\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper shows how to build tiny fluid channels (microfluidics) that move molecules automatically using electric fields, called isotachophoresis (ITP). They made networks of small paths where charged molecules (like DNA or proteins) are pushed and separated precisely without pumps—just voltage. By designing special “junctions,” molecules split and go different ways based on their charge and speed, creating complex flow patterns inside a chip. They used clever electrode setups and geometry to control where molecules go, so different parts of a circuit can process or mix molecules on demand. This lets you program tiny “biological circuits” that sort, combine, or move molecules automatically, like a biological computer. It’s a new way to make self-driving biochemical “wiring” without valves or pumps, just electric fields. Useful for fast, portable tests or building synthetic cell parts that move molecules on command.  \nSource: https://www.pnas.org/doi/full/10.1073/pnas.2511724122\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows that different legume plants control how their rhizobia bacteria glow (fluorescence) inside roots, and this glow changes over time in a host-specific way. They made bacteria that produce a fluorescent protein that turns on when bacteria are active, then watched how bright they got inside different plant types. Surprisingly, bacteria in some plants glowed strongly early but then dimmed, while in others they stayed bright longer. They used tiny genetic switches (synthetic circuits) to make bacteria turn on fluorescence only when active, plus time sensors to track timing. This shows plants can "tune" bacteria behavior without changing bacteria DNA—just by how they control signals. It reveals plants send different signals to bacteria, controlling their activity dynamically. This helps design smart bacteria that respond differently in different hosts—useful for precise microbiome control.  \n[source: https://www.biorxiv.org/content/10.1101/2025.10.11.681774v2.full-text]\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study made a smart vaccine that activates immune cells only when needed, using a tiny "nanovaccine" that responds to a trigger (like a stimulus). They packaged a STING activator (a molecule that boosts immune signals) and HPV pieces inside special particles that stay inactive until triggered. When they give a small signal (like a mild acid or enzyme), the particles release the STING stimulator, turning on immune cells only at the right time. They also added a water-in-oil "depot" (like a slow-release bubble) to keep the vaccine at the site longer, boosting response without extra shots. They used synthetic biology tricks—like designing particles that change shape or release cargo only when triggered—to control when and where immune signals happen. This makes a "smart" vaccine that avoids overactivation and targets immune activation exactly when needed. It shows how designing responsive particles can improve vaccines with precise control.  \nSource: https://www.pnas.org/doi/10.1073/pnas.2409570122\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study explores how different signals (bias) happen when GPCRs (cell surface receptors) like cannabinoid or melanocortin receptors are activated—some signals turn on only certain pathways. They show that small changes in receptor parts or ligands (like drugs) make the receptor prefer one pathway over another, like favoring "G protein" vs. "beta-arrestin" signals. They used computer simulations (molecular mechanics) and clever mutations to see how tiny tweaks change signaling bias. This helps synthetic biologists design custom receptors or drugs that only turn on desired signals, reducing side effects. They also tracked how different ligands stabilize specific receptor shapes, using new modeling to predict bias. Basically, they show how to program receptors to be "biased" by design, enabling smarter control of cell signals. Key: tune receptor shape to get only the signals you want.  \nSource: https://www.cell.com/trends/pharmacological-sciences/fulltext/S0165-6147(25)00232-9\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used very strong (ultra-high field) 31P magnetic resonance spectroscopy (MRS) to directly watch how cells’ energy and metabolism change in real time. They measured phosphorus-containing molecules (like ATP, NADH) inside living tissue without breaking cells. By doing this at high detail, they saw how key pathways—glycolysis, TCA cycle, electron transport, fats, ketones—depend on redox (electron) reactions. They showed how shifting redox states quickly changes energy molecules, revealing control points. They also developed new methods to track fast changes in NADH/NAD+ (redox carriers) with minimal disturbance. For synthetic biology, this means you can non-invasively monitor engineered pathways’ energy flow and redox balance live, guiding better design. They achieved this with ultra-high field (14.1T) MRI + clever spectral tricks—super detailed, real-time metabolic readouts.  \nSource: https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    	\n    <p style="text-align: left; font-weight: normal; margin-bottom: 20px;">Today's newsletter covers 10 articles in synthetic biology and biotechnology.</p>\n  \n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study designed tiny biosensors that detect a molecule called D2HG (a modified form of a metabolite) by mimicking how bacteria sense signals. They built proteins that change shape when D2HG is present, turning that into a visible signal (like fluorescence). To do this, they used a clever approach: they took parts of natural proteins that bind similar molecules and rewired them so they only respond to D2HG. They also used a new method to find the best sensor parts quickly—mixing and testing many versions at once (like DNA "libraries" and high-throughput screening). This creates customizable, fast sensors that light up when D2HG is there, useful for measuring cell metabolism or controlling gene circuits. Basically, they made a new plug-in tool for cells to "report" on D2HG levels, inspired by how bacteria detect signals.  \n[Source: https://www.cell.com/cell-chemical-biology/fulltext/S2451-9456(25)00341-1]\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        They made new biosensors (called DHsers) that detect a molecule called D2HG, a small chemical inside cells. They learned how D2HG controls a protein DhdR by studying its structure—how it binds D2HG and turns on/off. Using that, they engineered proteins that change shape or signal when D2HG is present, so they can measure how much is there. They tuned these sensors to detect different D2HG levels by changing parts of the protein—like adjusting sensitivity. This is synthetic biology because they designed new proteins that act like tiny chemical switches, reporting D2HG levels directly inside cells. They used structural info and protein design to make sensors that are fast, adjustable, and specific. Now, scientists can track D2HG in cells easily, useful for cancer or metabolism studies. They combined understanding of protein regulation with custom design to make new detection tools.  \n[https://www.cell.com/cell-chemical-biology/newarticles](https://www.cell.com/cell-chemical-biology/newarticles)\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows how blocking ENO1 (enolase 1), a key enzyme in glycolysis (glucose breakdown), outside its usual active site (non-orthosteric) stops cancer cell growth. Instead of blocking ENO1’s normal spot, they bind elsewhere to change its shape and activity—like allosteric control—using specially designed molecules. This prevents cancer cells from making energy and building blocks needed to grow, especially in triple-negative tumors. They used clever synthetic molecules that stick somewhere else on ENO1, changing its behavior without blocking the active site—so it’s a new way to turn off enzymes. This approach is precise, avoids side effects, and shows how to rewire metabolism with small “designer” binders. Basically, they hijacked enzyme shape-shifting to shut down cancer metabolism. It’s a synthetic biology trick: control enzymes allosterically with custom binders, not just active-site inhibitors.  \nSource: [Cell Reports Medicine](https://www.cell.com/cell-reports-medicine/fulltext/S2666-3791(25)00524-5)\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://connect.biorxiv.org/archive/show_cat.php?cat=ecology">\n          bioRxiv directory\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">connect.biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study found that a protein called CRK2 controls when Arabidopsis plants flower, working together with a RNA-binding protein (GRP7). They showed CRK2 adds phosphate groups (a chemical tag) to GRP7, changing how it works—like turning a switch on/off. Using special sensors, they tracked where and when GRP7 gets phosphorylated (tagged) inside cells. Phosphorylation made GRP7 bind more strongly to certain RNAs that control flowering genes, speeding up flowering. They made custom versions of GRP7 that can’t be phosphorylated to test if phosphorylation is key—these plants flowered later. So, they used clever protein tags and mutant versions to link CRK2’s kinase activity to GRP7’s RNA binding and flowering timing. This shows how designing proteins that modify each other can program plants’ development—useful for synthetic circuits controlling growth.  \nSource: [bioRxiv summary](https://connect.biorxiv.org/archive/show_cat.php?cat=ecology)\n      </div>\n      <div class="article-link">\n        <a href="https://connect.biorxiv.org/archive/show_cat.php?cat=ecology" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study made a tiny, wearable sensor that detects nicotine in sweat using engineered biology. They built a living “biosensor” by putting a custom enzyme (NicA2) that breaks down nicotine into a signal, connected to a redox (electron transfer) system. They used synthetic DNA parts to program bacteria or proteins to produce this enzyme and link it to an electron acceptor (like CycN) that sends a current when nicotine is present. They integrated these parts into a flexible device that sticks on skin and measures sweat nicotine directly—no lab needed. Key tricks: they designed new protein circuits that turn nicotine into an electrical signal fast and specific, and made it work in tiny, wearable electronics. This shows how to turn biological parts into real-time chemical sensors on skin, using gene design and electron wiring. It’s a proof that living parts can make cheap, portable drug monitors.  \nSource: https://www.biorxiv.org/content/biorxiv/early/2025/11/06/2025.10.31.685570.full.pdf\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper shows how to build tiny fluid channels (microfluidics) that move molecules automatically using electric fields, called isotachophoresis (ITP). They made networks of small paths where charged molecules (like DNA or proteins) are pushed and separated precisely without pumps—just voltage. By designing special “junctions,” molecules split and go different ways based on their charge and speed, creating complex flow patterns inside a chip. They used clever electrode setups and geometry to control where molecules go, so different parts of a circuit can process or mix molecules on demand. This lets you program tiny “biological circuits” that sort, combine, or move molecules automatically, like a biological computer. It’s a new way to make self-driving biochemical “wiring” without valves or pumps, just electric fields. Useful for fast, portable tests or building synthetic cell parts that move molecules on command.  \nSource: https://www.pnas.org/doi/full/10.1073/pnas.2511724122\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows that different legume plants control how their rhizobia bacteria glow (fluorescence) inside roots, and this glow changes over time in a host-specific way. They made bacteria that produce a fluorescent protein that turns on when bacteria are active, then watched how bright they got inside different plant types. Surprisingly, bacteria in some plants glowed strongly early but then dimmed, while in others they stayed bright longer. They used tiny genetic switches (synthetic circuits) to make bacteria turn on fluorescence only when active, plus time sensors to track timing. This shows plants can "tune" bacteria behavior without changing bacteria DNA—just by how they control signals. It reveals plants send different signals to bacteria, controlling their activity dynamically. This helps design smart bacteria that respond differently in different hosts—useful for precise microbiome control.  \n[source: https://www.biorxiv.org/content/10.1101/2025.10.11.681774v2.full-text]\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study made a smart vaccine that activates immune cells only when needed, using a tiny "nanovaccine" that responds to a trigger (like a stimulus). They packaged a STING activator (a molecule that boosts immune signals) and HPV pieces inside special particles that stay inactive until triggered. When they give a small signal (like a mild acid or enzyme), the particles release the STING stimulator, turning on immune cells only at the right time. They also added a water-in-oil "depot" (like a slow-release bubble) to keep the vaccine at the site longer, boosting response without extra shots. They used synthetic biology tricks—like designing particles that change shape or release cargo only when triggered—to control when and where immune signals happen. This makes a "smart" vaccine that avoids overactivation and targets immune activation exactly when needed. It shows how designing responsive particles can improve vaccines with precise control.  \nSource: https://www.pnas.org/doi/10.1073/pnas.2409570122\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study explores how different signals (bias) happen when GPCRs (cell surface receptors) like cannabinoid or melanocortin receptors are activated—some signals turn on only certain pathways. They show that small changes in receptor parts or ligands (like drugs) make the receptor prefer one pathway over another, like favoring "G protein" vs. "beta-arrestin" signals. They used computer simulations (molecular mechanics) and clever mutations to see how tiny tweaks change signaling bias. This helps synthetic biologists design custom receptors or drugs that only turn on desired signals, reducing side effects. They also tracked how different ligands stabilize specific receptor shapes, using new modeling to predict bias. Basically, they show how to program receptors to be "biased" by design, enabling smarter control of cell signals. Key: tune receptor shape to get only the signals you want.  \nSource: https://www.cell.com/trends/pharmacological-sciences/fulltext/S0165-6147(25)00232-9\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf">\n          Ultra-High Field 31P functional Magnetic Resonance Spectroscopy ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">biorxiv.org</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used very strong (ultra-high field) 31P magnetic resonance spectroscopy (MRS) to directly watch how cells’ energy and metabolism change in real time. They measured phosphorus-containing molecules (like ATP, NADH) inside living tissue without breaking cells. By doing this at high detail, they saw how key pathways—glycolysis, TCA cycle, electron transport, fats, ketones—depend on redox (electron) reactions. They showed how shifting redox states quickly changes energy molecules, revealing control points. They also developed new methods to track fast changes in NADH/NAD+ (redox carriers) with minimal disturbance. For synthetic biology, this means you can non-invasively monitor engineered pathways’ energy flow and redox balance live, guiding better design. They achieved this with ultra-high field (14.1T) MRI + clever spectral tricks—super detailed, real-time metabolic readouts.  \nSource: https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf\n      </div>\n      <div class="article-link">\n        <a href="https://www.biorxiv.org/content/10.1101/2025.11.02.686085v1.full.pdf" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    	deterministic-template-v1	10	ad99e6e8-d286-4016-bed1-5d9204bf156a	2025-11-09 19:54:06.365507+00
ee99e0f1-9403-4279-ac95-a2da5780c5f1	6b207353-c60b-423f-abe3-5bba22d21054	\n    <p style="text-align: left; font-weight: normal; margin-bottom: 20px;">Today's newsletter covers 10 articles in synthetic biology and biotechnology.</p>\n  \n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/natbiomedeng/">\n          Nature Biomedical Engineering\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed a fast, modular way to build and test custom DNA parts inside the chloroplast (the photosynthesis machine) of *Chlamydomonas* algae. They made a toolkit of interchangeable pieces (like Lego blocks) for inserting genes, promoters, and other parts, so they can quickly assemble many different designs. Using high-throughput methods (testing lots of variants at once), they screened hundreds of combinations to find ones that turn on genes strongly or control expression precisely. They also used a new way to measure how well each design works inside the chloroplast without destroying cells. This lets scientists rapidly optimize genetic circuits for better photosynthesis or making useful compounds. The key is modular, standardized parts + fast testing to engineer chloroplasts more easily. This speeds up making custom chloroplasts for biotech.  \nSource: [https://www.nature.com/articles/s41477-025-02126-2](https://www.nature.com/articles/s41477-025-02126-2)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/natbiomedeng/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/">\n          Halogenases and dehalogenases: mechanisms, engineering, and ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubmed.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This review explains how scientists can edit bacterial genomes more precisely and quickly using big-scale DNA tools. They now make tiny, exact changes across the whole bacterial DNA (genome) instead of one gene at a time. New methods use things like CRISPR or DNA "scissors" combined with tricks to target many spots at once, making edits faster and more reliable. They also build DNA parts that can insert or delete big chunks smoothly. This lets design bacteria with new functions or optimize pathways efficiently. The key is combining precise cutting with smart DNA templates and automation, so edits are fast, accurate, and scalable. These advances turn bacteria into customizable "hardware" for biotech, like tiny computers or factories. Overall, they made genome editing more like programming with code—big, precise, and programmable. (See more: https://pubmed.ncbi.nlm.nih.gov/41182907/)\n      </div>\n      <div class="article-link">\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/">\n          Halogenases and dehalogenases: mechanisms, engineering, and ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubmed.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This Australian research shows how scientists are building custom DNA parts and tiny biological circuits to control cells precisely. They used new methods to design DNA sequences that make bacteria or yeast do specific things—like turn on a gene only when two signals are present (logic AND gates). They also made “modular” parts that can be swapped easily, so engineers can quickly build new devices. They used clever DNA “scaffolds” to hold enzymes close together, speeding up reactions—like making a tiny factory. These tools let them program cells to sense things, make medicines, or produce chemicals more reliably. The key is designing DNA sequences that behave predictably, using computer models and testing many variants fast. This work makes it easier to build complex, reliable biological “machines” in microbes—like programmable bio-robots. (More at https://pubmed.ncbi.nlm.nih.gov/41200406/)\n      </div>\n      <div class="article-link">\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/natbiomedeng/">\n          Nature Biomedical Engineering\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper shows a faster way to make and test new DNA parts or pathways in synthetic biology. Normally, scientists use a cycle: **Design** what they want, **Build** the DNA, **Test** if it works, then **Learn** from results to improve. But here, they flip it: instead of designing first, they use **machine learning** (smart computer guesses) to *predict* good parts *before* building. They also use **cell-free tests**—mixing DNA and enzymes in test tubes without living cells—to quickly check many designs *without* waiting for bacteria to grow. This combo (called LDBT, Learning-Design-Build-Test) is much faster than old ways. They train models on tiny test reactions, then predict good DNA sequences, test in seconds, and improve fast. So, instead of slow cycles, they do rapid guessing and testing, speeding up finding useful DNA parts.  \nSource: [https://www.nature.com/articles/s41467-025-65281-2](https://www.nature.com/articles/s41467-025-65281-2)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/natbiomedeng/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12582554/">\n          A comprehensive review of genomic-scale genetic engineering as a strategy to improve bacterial productivity\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pmc.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This article describes how Australia is building better tools and teamwork to design custom biology parts—like tiny DNA switches or circuits—using synthetic biology. They set up new labs and shared resources so scientists can make and test engineered microbes faster. They used clever ways to connect different parts (like Lego blocks) into bigger systems, and shared data openly so everyone can improve designs. They also made special “bio factories” that produce useful chemicals or medicines cheaply. Key ideas: Australia’s big infrastructure (labs, data), teamwork across groups, and new methods to quickly test many designs at once. They made robots and automated tests to try lots of DNA combos fast, saving time. Overall, they’re making biology more like engineering—building predictable, reliable parts—and sharing tools so others can do the same.  \nSource: [https://pmc.ncbi.nlm.nih.gov/articles/PMC12588174/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12588174/)\n      </div>\n      <div class="article-link">\n        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12582554/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/">\n          Halogenases and dehalogenases: mechanisms, engineering, and ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubmed.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows how combining AI with automated "biofoundries" (robotic labs that make proteins) speeds up designing new proteins. They used AI to predict which mutations (changes in protein DNA) make proteins work better or have new jobs, then automatically built and tested those proteins in tiny machines. Instead of guessing, AI quickly suggested good changes; robots made and checked them fast. They used a new method where AI learns from lots of data to suggest smart mutations, and robots do the building/testing without much human help. This makes finding better proteins much faster—days instead of months. It shows AI + robots can invent proteins by smartly trying many options automatically. So, instead of slow trial-and-error, they "train" AI to pick good edits, then let robots make/test them. It’s a super-efficient way to engineer proteins quickly.  \nSource: https://pubmed.ncbi.nlm.nih.gov/41192167/\n      </div>\n      <div class="article-link">\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/natbiomedeng/">\n          Nature Biomedical Engineering\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This research shows how scientists redesign microbes (like bacteria and yeast) to make useful chemicals more efficiently—called metabolic engineering. They tweak the organism’s genes to reroute how it makes stuff, so it produces lots of a target molecule instead of growing or doing normal work. For example, they built a pathway in *Pseudomonas* bacteria so it makes the purple pigment xanthommatin only when it’s growing—so production is linked to growth (“growth-coupled”), making it easier to get lots of product. They also combined chemical steps with biology: they break down plastic (polystyrene) into small pieces chemically, then engineer microbes to turn those pieces into adipic acid (used in nylon). They used new tricks like inserting enzymes that turn waste into high-volume chemicals, or powering cell energy with light (optogenetics). Overall, they show how to program microbes to turn cheap waste into valuable stuff by smart gene edits and combining chemistry + biology.  \nMore at: [https://www.nature.com/subjects/metabolic-engineering](https://www.nature.com/subjects/metabolic-engineering)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/natbiomedeng/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/natbiomedeng/">\n          Nature Biomedical Engineering\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used a clever way to turn off a muscle protein called titin by mechanically "knocking out" (removing) its tension, without cutting its gene. They applied tiny forces to titin in muscle fibers to pull on it until it lost tension, then saw what happened. Losing titin tension made muscles weaken and shrink (atrophy), showing that tension in titin helps keep muscles healthy. They used special tools: tiny magnetic or optical forces to pull on titin directly inside living muscle fibers, and sensors to measure tension. This is like a synthetic biology trick—using mechanical force and sensors instead of genetic edits—to control protein state. Key idea: pulling titin out of tension triggers muscle loss, so tension acts as a "health signal." This shows how physical forces in proteins can be a switch for cell behavior, opening ways to design force-sensitive parts. [source: https://www.nature.com/natbiomedeng/]\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/natbiomedeng/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/">\n          Halogenases and dehalogenases: mechanisms, engineering, and ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubmed.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper explains how enzymes called halogenases add halogen atoms (like Cl or Br) to molecules, and how dehalogenases remove them—like molecular switches. They show how halogenases use oxygen and iron to attach halogens selectively to specific spots on small molecules, enabling precise chemical edits. Scientists engineered these enzymes to be more flexible or work on new targets by changing their parts (mutations) or swapping domains, making custom “halogenators.” They also made dehalogenases that can undo halogenation, giving reversible control. They used tricks like attaching tags or changing enzyme shapes to guide where halogens go. This lets synthetic biologists program cells to make or remove halogens on drugs or flavors, building tiny chemical “lego” parts. Key: precise, switchable halogen editing by customizing enzymes—useful for making new molecules cleanly.  \nSource: https://pubmed.ncbi.nlm.nih.gov/41181914/\n      </div>\n      <div class="article-link">\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12582554/">\n          A comprehensive review of genomic-scale genetic engineering as a strategy to improve bacterial productivity\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pmc.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This review explains how scientists can redesign bacteria by editing their entire genomes (all their genes at once) to make them produce more useful stuff, like chemicals or medicines. Instead of changing one gene at a time, they make big, systematic changes across the bacterial DNA—like deleting, swapping, or tuning many genes all at once. They use smart methods (like editing many parts at once with DNA scissors and computers to pick the best versions) to find bacteria that grow faster or make more product. This way, they quickly find the best “super bacteria” without trial-and-error. The key idea: big, genome-wide edits combined with smart screening let you optimize bacteria faster and more completely. It’s like rewiring the whole circuit board instead of fixing one wire. They show how combining many small edits and testing lots of bacteria helps improve productivity efficiently.  \n**Source:** [https://pmc.ncbi.nlm.nih.gov/articles/PMC12582554/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12582554/)\n      </div>\n      <div class="article-link">\n        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12582554/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    	\n    <p style="text-align: left; font-weight: normal; margin-bottom: 20px;">Today's newsletter covers 10 articles in synthetic biology and biotechnology.</p>\n  \n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/natbiomedeng/">\n          Nature Biomedical Engineering\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study developed a fast, modular way to build and test custom DNA parts inside the chloroplast (the photosynthesis machine) of *Chlamydomonas* algae. They made a toolkit of interchangeable pieces (like Lego blocks) for inserting genes, promoters, and other parts, so they can quickly assemble many different designs. Using high-throughput methods (testing lots of variants at once), they screened hundreds of combinations to find ones that turn on genes strongly or control expression precisely. They also used a new way to measure how well each design works inside the chloroplast without destroying cells. This lets scientists rapidly optimize genetic circuits for better photosynthesis or making useful compounds. The key is modular, standardized parts + fast testing to engineer chloroplasts more easily. This speeds up making custom chloroplasts for biotech.  \nSource: [https://www.nature.com/articles/s41477-025-02126-2](https://www.nature.com/articles/s41477-025-02126-2)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/natbiomedeng/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/">\n          Halogenases and dehalogenases: mechanisms, engineering, and ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubmed.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This review explains how scientists can edit bacterial genomes more precisely and quickly using big-scale DNA tools. They now make tiny, exact changes across the whole bacterial DNA (genome) instead of one gene at a time. New methods use things like CRISPR or DNA "scissors" combined with tricks to target many spots at once, making edits faster and more reliable. They also build DNA parts that can insert or delete big chunks smoothly. This lets design bacteria with new functions or optimize pathways efficiently. The key is combining precise cutting with smart DNA templates and automation, so edits are fast, accurate, and scalable. These advances turn bacteria into customizable "hardware" for biotech, like tiny computers or factories. Overall, they made genome editing more like programming with code—big, precise, and programmable. (See more: https://pubmed.ncbi.nlm.nih.gov/41182907/)\n      </div>\n      <div class="article-link">\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/">\n          Halogenases and dehalogenases: mechanisms, engineering, and ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubmed.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This Australian research shows how scientists are building custom DNA parts and tiny biological circuits to control cells precisely. They used new methods to design DNA sequences that make bacteria or yeast do specific things—like turn on a gene only when two signals are present (logic AND gates). They also made “modular” parts that can be swapped easily, so engineers can quickly build new devices. They used clever DNA “scaffolds” to hold enzymes close together, speeding up reactions—like making a tiny factory. These tools let them program cells to sense things, make medicines, or produce chemicals more reliably. The key is designing DNA sequences that behave predictably, using computer models and testing many variants fast. This work makes it easier to build complex, reliable biological “machines” in microbes—like programmable bio-robots. (More at https://pubmed.ncbi.nlm.nih.gov/41200406/)\n      </div>\n      <div class="article-link">\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/natbiomedeng/">\n          Nature Biomedical Engineering\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper shows a faster way to make and test new DNA parts or pathways in synthetic biology. Normally, scientists use a cycle: **Design** what they want, **Build** the DNA, **Test** if it works, then **Learn** from results to improve. But here, they flip it: instead of designing first, they use **machine learning** (smart computer guesses) to *predict* good parts *before* building. They also use **cell-free tests**—mixing DNA and enzymes in test tubes without living cells—to quickly check many designs *without* waiting for bacteria to grow. This combo (called LDBT, Learning-Design-Build-Test) is much faster than old ways. They train models on tiny test reactions, then predict good DNA sequences, test in seconds, and improve fast. So, instead of slow cycles, they do rapid guessing and testing, speeding up finding useful DNA parts.  \nSource: [https://www.nature.com/articles/s41467-025-65281-2](https://www.nature.com/articles/s41467-025-65281-2)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/natbiomedeng/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12582554/">\n          A comprehensive review of genomic-scale genetic engineering as a strategy to improve bacterial productivity\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pmc.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This article describes how Australia is building better tools and teamwork to design custom biology parts—like tiny DNA switches or circuits—using synthetic biology. They set up new labs and shared resources so scientists can make and test engineered microbes faster. They used clever ways to connect different parts (like Lego blocks) into bigger systems, and shared data openly so everyone can improve designs. They also made special “bio factories” that produce useful chemicals or medicines cheaply. Key ideas: Australia’s big infrastructure (labs, data), teamwork across groups, and new methods to quickly test many designs at once. They made robots and automated tests to try lots of DNA combos fast, saving time. Overall, they’re making biology more like engineering—building predictable, reliable parts—and sharing tools so others can do the same.  \nSource: [https://pmc.ncbi.nlm.nih.gov/articles/PMC12588174/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12588174/)\n      </div>\n      <div class="article-link">\n        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12582554/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/">\n          Halogenases and dehalogenases: mechanisms, engineering, and ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubmed.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study shows how combining AI with automated "biofoundries" (robotic labs that make proteins) speeds up designing new proteins. They used AI to predict which mutations (changes in protein DNA) make proteins work better or have new jobs, then automatically built and tested those proteins in tiny machines. Instead of guessing, AI quickly suggested good changes; robots made and checked them fast. They used a new method where AI learns from lots of data to suggest smart mutations, and robots do the building/testing without much human help. This makes finding better proteins much faster—days instead of months. It shows AI + robots can invent proteins by smartly trying many options automatically. So, instead of slow trial-and-error, they "train" AI to pick good edits, then let robots make/test them. It’s a super-efficient way to engineer proteins quickly.  \nSource: https://pubmed.ncbi.nlm.nih.gov/41192167/\n      </div>\n      <div class="article-link">\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/natbiomedeng/">\n          Nature Biomedical Engineering\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This research shows how scientists redesign microbes (like bacteria and yeast) to make useful chemicals more efficiently—called metabolic engineering. They tweak the organism’s genes to reroute how it makes stuff, so it produces lots of a target molecule instead of growing or doing normal work. For example, they built a pathway in *Pseudomonas* bacteria so it makes the purple pigment xanthommatin only when it’s growing—so production is linked to growth (“growth-coupled”), making it easier to get lots of product. They also combined chemical steps with biology: they break down plastic (polystyrene) into small pieces chemically, then engineer microbes to turn those pieces into adipic acid (used in nylon). They used new tricks like inserting enzymes that turn waste into high-volume chemicals, or powering cell energy with light (optogenetics). Overall, they show how to program microbes to turn cheap waste into valuable stuff by smart gene edits and combining chemistry + biology.  \nMore at: [https://www.nature.com/subjects/metabolic-engineering](https://www.nature.com/subjects/metabolic-engineering)\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/natbiomedeng/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://www.nature.com/natbiomedeng/">\n          Nature Biomedical Engineering\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">nature.com</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This study used a clever way to turn off a muscle protein called titin by mechanically "knocking out" (removing) its tension, without cutting its gene. They applied tiny forces to titin in muscle fibers to pull on it until it lost tension, then saw what happened. Losing titin tension made muscles weaken and shrink (atrophy), showing that tension in titin helps keep muscles healthy. They used special tools: tiny magnetic or optical forces to pull on titin directly inside living muscle fibers, and sensors to measure tension. This is like a synthetic biology trick—using mechanical force and sensors instead of genetic edits—to control protein state. Key idea: pulling titin out of tension triggers muscle loss, so tension acts as a "health signal." This shows how physical forces in proteins can be a switch for cell behavior, opening ways to design force-sensitive parts. [source: https://www.nature.com/natbiomedeng/]\n      </div>\n      <div class="article-link">\n        <a href="https://www.nature.com/natbiomedeng/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/">\n          Halogenases and dehalogenases: mechanisms, engineering, and ...\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pubmed.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This paper explains how enzymes called halogenases add halogen atoms (like Cl or Br) to molecules, and how dehalogenases remove them—like molecular switches. They show how halogenases use oxygen and iron to attach halogens selectively to specific spots on small molecules, enabling precise chemical edits. Scientists engineered these enzymes to be more flexible or work on new targets by changing their parts (mutations) or swapping domains, making custom “halogenators.” They also made dehalogenases that can undo halogenation, giving reversible control. They used tricks like attaching tags or changing enzyme shapes to guide where halogens go. This lets synthetic biologists program cells to make or remove halogens on drugs or flavors, building tiny chemical “lego” parts. Key: precise, switchable halogen editing by customizing enzymes—useful for making new molecules cleanly.  \nSource: https://pubmed.ncbi.nlm.nih.gov/41181914/\n      </div>\n      <div class="article-link">\n        <a href="https://pubmed.ncbi.nlm.nih.gov/41181914/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    \n\n    <article class="article-block">\n      <h2>\n        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12582554/">\n          A comprehensive review of genomic-scale genetic engineering as a strategy to improve bacterial productivity\n        </a>\n      </h2>\n      <div class="article-meta">\n        <span class="source">pmc.ncbi.nlm.nih.gov</span> • \n        <span class="relevancy">Relevancy: 20%</span>\n      </div>\n      <div class="article-summary">\n        This review explains how scientists can redesign bacteria by editing their entire genomes (all their genes at once) to make them produce more useful stuff, like chemicals or medicines. Instead of changing one gene at a time, they make big, systematic changes across the bacterial DNA—like deleting, swapping, or tuning many genes all at once. They use smart methods (like editing many parts at once with DNA scissors and computers to pick the best versions) to find bacteria that grow faster or make more product. This way, they quickly find the best “super bacteria” without trial-and-error. The key idea: big, genome-wide edits combined with smart screening let you optimize bacteria faster and more completely. It’s like rewiring the whole circuit board instead of fixing one wire. They show how combining many small edits and testing lots of bacteria helps improve productivity efficiently.  \n**Source:** [https://pmc.ncbi.nlm.nih.gov/articles/PMC12582554/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12582554/)\n      </div>\n      <div class="article-link">\n        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12582554/" target="_blank">Read full article →</a>\n      </div>\n    </article>\n    	deterministic-template-v1	10	ed891af1-b146-4659-ab40-6a2cd8644854	2025-11-10 00:30:45.716988+00
\.


--
-- Data for Name: email_recipients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_recipients (id, email, name, preferences, active, created_at, updated_at, user_id) FROM stdin;
4	ashtekar@gmail.com	Ashish Ashtekar	{"format": "html", "frequency": "daily"}	t	2025-10-10 19:37:33.3418	2025-10-10 19:37:33.223	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
\.


--
-- Data for Name: search_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.search_settings (id, query, max_results, sources, created_at, updated_at, time_window) FROM stdin;
12	synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome	100	["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"]	2025-10-24 16:42:58.62	2025-10-24 16:42:58.62	7200
1	synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome	100	["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"]	2025-10-10 19:20:32.079076	2025-10-15 18:51:02.815	7200
4	synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome	100	["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"]	2025-10-15 19:16:56.311	2025-10-15 19:16:56.311	7200
5	synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome	100	["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"]	2025-10-15 20:07:58.145	2025-10-15 20:07:58.145	7200
6	synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome	100	["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"]	2025-10-15 22:40:40.438	2025-10-15 22:40:40.438	7200
7	synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome	100	["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"]	2025-10-16 00:10:31.556	2025-10-16 00:10:31.556	7200
8	synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome	100	["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"]	2025-10-18 00:20:58.182	2025-10-18 00:20:58.182	7200
9	synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome	100	["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"]	2025-10-18 23:48:28.268	2025-10-18 23:48:28.268	7200
10	synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome	100	["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"]	2025-10-19 00:00:59.208	2025-10-19 00:00:59.208	7200
11	synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome	100	["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"]	2025-10-20 15:44:08.022	2025-10-20 15:44:08.022	7200
\.


--
-- Data for Name: summary_evaluations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.summary_evaluations (id, summary_id, grader_email, grader_name, simple_terminology, clear_concept, clear_methodology, balanced_details, feedback, created_at, user_id) FROM stdin;
6497ff1f-5b3f-4c10-8b33-93ef858a17d7	9019e17a-e534-4f66-a134-95c5c1d94959	ashtekar@gmail.com	Ashish Ashtekar	1.00	0.80	0.60	0.80	\N	2025-11-03 00:11:33.923631+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
9733edb0-41a6-4ca4-bc1d-f64ed28b1525	1a5d3e11-4626-4d37-ad73-2461734cd61e	ashtekar@gmail.com	Ashish Ashtekar	1.00	0.80	0.70	0.80	\N	2025-11-03 00:14:14.362925+00	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
06c28eee-3daf-4417-a0b1-23254d54ac8d	9019e17a-e534-4f66-a134-95c5c1d94959	ashtekar2010@gmail.com	ashtekar2010@gmail.com	1.00	0.30	0.30	0.10	\N	2025-11-06 19:23:10.488243+00	\N
b7309806-46b1-4daa-86b7-4db9eb8937cb	e19abf25-c80c-4c9b-a8c1-e416433ceca6	ashtekar2010@gmail.com	ashtekar2010@gmail.com	1.00	0.70	0.50	0.40	\N	2025-11-06 19:24:08.640496+00	\N
0ab2fa32-3fab-417a-9233-9b41dd80713b	f30d0cca-1134-435c-974e-e7602e0f182c	ashtekar2010@gmail.com	ashtekar2010@gmail.com	0.80	0.80	0.40	0.70	\N	2025-11-06 19:25:15.587307+00	\N
ddaec81f-da13-441b-846a-05710a2b778d	1a5d3e11-4626-4d37-ad73-2461734cd61e	ashtekar2010@gmail.com	ashtekar2010@gmail.com	0.90	0.80	0.70	0.90	\N	2025-11-06 19:26:27.23721+00	\N
f681ade4-8cf7-4ab7-9882-d1ac2f77f28c	3bf38e49-ed2b-4b27-8ba7-666e1c8531a7	ashtekar2010@gmail.com	ashtekar2010@gmail.com	0.90	0.80	0.70	0.80	\N	2025-11-06 19:27:25.433165+00	\N
28e59d8e-b6d8-4d67-bdae-f6d22babedfd	a5865b82-5706-4992-9271-17b912a40c52	ashtekar2010@gmail.com	ashtekar2010@gmail.com	0.80	0.10	0.10	0.20	\N	2025-11-08 03:51:03.826814+00	\N
8bd3499d-9b94-465b-b1cb-ca6b4eca1a1c	ff1a6586-1652-4dc3-9d1c-930e8c88ce0c	ashtekar2010@gmail.com	ashtekar2010@gmail.com	0.80	0.10	0.20	0.30	\N	2025-11-08 03:55:08.782905+00	\N
7222246f-cc7c-4936-a9ed-e1992392d2f2	c62c6b19-61bd-4caf-85b7-98f2fe95ba1e	ashtekar2010@gmail.com	ashtekar2010@gmail.com	1.00	0.80	0.40	0.80	\N	2025-11-08 03:56:06.215896+00	\N
82a032dc-9335-433d-b869-6c0db35341d9	13213d43-0d17-4cf3-8d15-5c0aae16e40d	ashtekar2010@gmail.com	ashtekar2010@gmail.com	0.90	0.80	0.70	0.80	\N	2025-11-08 03:57:09.427816+00	\N
e329c27e-e903-43e3-9e5e-051282ed1dba	02577182-5a1e-45dc-bca0-63d36003dd0d	ashtekar2010@gmail.com	ashtekar2010@gmail.com	1.00	0.30	0.10	0.20	\N	2025-11-08 03:58:30.639049+00	\N
fc2273bd-23fb-4242-8430-f4bac32116f7	e19abf25-c80c-4c9b-a8c1-e416433ceca6	ashtekar@gmail.com	Ashish Ashtekar	0.90	0.60	0.40	0.50	\N	2025-11-08 20:32:48.82787+00	\N
8d8f3276-1103-4774-a541-a3211be9adb9	3a46e406-1737-436a-9e68-5df93373ed57	ashtekar2010@gmail.com	ashtekar2010@gmail.com	0.80	0.90	0.90	1.00	\N	2025-11-10 02:08:50.690753+00	\N
cc44f3f5-a9c4-4062-8406-badc86e7e487	91abfba6-30f3-4d2d-96b9-598f0e23fd2c	ashtekar2010@gmail.com	ashtekar2010@gmail.com	0.40	0.30	0.10	0.50	\N	2025-11-10 02:10:24.953375+00	\N
d586fea3-227e-4091-a2bf-0f28e572a771	f88ab315-85d2-424f-950e-8d693cd39f12	ashtekar2010@gmail.com	ashtekar2010@gmail.com	1.00	0.20	0.60	0.20	\N	2025-11-10 02:17:57.734575+00	\N
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (id, summary_length, target_audience, include_citations, email_template, llm_model, llm_temperature, llm_max_tokens, created_at, updated_at, relevancy_threshold, user_id) FROM stdin;
16	150	college sophomore	t	default	ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1	0.30	1000	2025-10-24 16:42:58.307	2025-10-24 16:42:58.307	0.20	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
\.


--
-- Data for Name: threads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.threads (id, run_date, status, articles_found, articles_processed, email_sent, langsmith_url, langsmith_run_id, error_message, started_at, completed_at, metadata, user_id) FROM stdin;
902a8c7f-e1aa-4a85-9252-edf365065bf3	2025-10-16	completed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-10-16T19:17:20.495Z	\N	\N	2025-10-16 19:17:20.495+00	2025-10-16 19:19:16.15+00	{"model": "gpt-4o-mini", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1760642240494", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.4}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
6ca7d46b-ca0c-42b8-ab06-69a648457423	2025-10-17	completed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-10-17T17:31:44.398Z	\N	\N	2025-10-17 17:31:44.398+00	2025-10-17 17:33:26.674+00	{"model": "gpt-4o-mini", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1760722304398", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.4}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
bb30c863-ffd4-4082-8c4d-6dc69b49f09e	2025-10-23	running	0	0	f	\N	\N	\N	2025-10-23 00:08:16.258+00	\N	{"model": "ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1761178096258", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
e95dfef2-7c41-4244-b68f-38045932cb45	2025-10-29	completed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-10-29T23:00:49.292Z	\N	\N	2025-10-29 23:00:49.292+00	2025-10-29 23:02:50.741+00	{"model": "ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1761778849291", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
d3a73a11-2907-4188-a0ac-d53caf3e27e2	2025-10-30	completed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-10-30T19:27:32.930Z	\N	\N	2025-10-30 19:27:32.93+00	2025-10-30 19:30:22.116+00	{"model": "ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1761852452930", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
1b09fb41-699d-4122-a450-1461f8c47a9c	2025-10-31	failed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-10-31T19:05:05.111Z	120ccef8-bfc7-40bd-9403-22af661e9325	Task not completed successfully	2025-10-31 19:05:05.111+00	2025-10-31 19:06:54.073+00	{"model": "ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1761937505111", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
0d48af8f-50a5-49c6-a803-1de597038f2d	2025-11-02	completed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-11-02T23:32:47.312Z	0a3845b3-5275-40f0-8c4f-a3e0bbcea39a	\N	2025-11-02 23:32:47.312+00	2025-11-02 23:34:42.414+00	{"model": "ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1762126367312", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
6b207353-c60b-423f-abe3-5bba22d21054	2025-11-10	completed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-11-10T00:30:06.144Z	ed891af1-b146-4659-ab40-6a2cd8644854	\N	2025-11-10 00:30:06.144+00	2025-11-10 00:31:31.44+00	{"model": "ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1762734606144", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
086ac147-cb9f-4a89-b81a-a8b3195a79d3	2025-10-18	completed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-10-18T00:14:31.139Z	\N	\N	2025-10-18 00:14:31.139+00	2025-10-18 00:16:24.815+00	{"model": "gpt-4o-mini", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1760746471138", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.4}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
fb698cfa-4b6c-4bf1-bd92-9dd1823c2ffb	2025-10-19	completed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-10-19T00:01:11.500Z	\N	\N	2025-10-19 00:01:11.5+00	2025-10-19 00:02:41.404+00	{"model": "gpt-4o-mini", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1760832071499", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
36d2e09f-f967-4899-8deb-c4437b13e2f8	2025-10-20	completed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-10-20T15:41:49.207Z	\N	\N	2025-10-20 15:41:49.207+00	2025-10-20 15:43:23.885+00	{"model": "gpt-4o-mini", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1760974909206", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
d2563a21-84c0-4c39-9fb9-e661a521ba6f	2025-10-21	completed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-10-21T21:07:26.852Z	\N	\N	2025-10-21 21:07:26.852+00	2025-10-21 21:09:27.902+00	{"model": "ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1761080846852", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
96b1982e-79af-479f-8189-40fa15402a68	2025-10-22	completed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-10-22T01:25:07.781Z	\N	\N	2025-10-22 01:25:07.781+00	2025-10-22 01:27:15.174+00	{"model": "ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1761096307781", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
c248f2d2-402a-44fd-9745-bcfdca0a1af2	2025-10-24	completed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-10-24T16:38:55.467Z	\N	\N	2025-10-24 16:38:55.467+00	2025-10-24 16:39:46.437+00	{"model": "ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1761323935467", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
bac092fc-7f57-4c06-8239-929c42711f0c	2025-11-08	failed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-11-08T16:05:38.946Z	62bb0bf1-ec7c-4d13-89b7-41d688e17a15	Task not completed successfully	2025-11-08 16:05:38.946+00	2025-11-08 16:07:28.409+00	{"model": "ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1762617938945", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
0b3b7cdd-5faa-4e20-b33d-9e2903b9f449	2025-11-09	failed	0	0	f	https://smith.langchain.com/o/a74c1027-1925-4e3c-94d4-eedca45d1acc/projects/p/agent-bio-summary-v2?timeModel=absolute&startTime=2025-11-09T19:53:19.117Z	ad99e6e8-d286-4016-bed1-5d9204bf156a	Task not completed successfully	2025-11-09 19:53:19.117+00	2025-11-09 19:54:39.054+00	{"model": "ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1", "sources": ["nature.com", "science.org", "biorxiv.org", "phys.org", "news.mit.edu", "academic.oup.com", "pnas.org", "sciencedirect.com", "pmc.ncbi.nlm.nih.gov", "genengnews.com"], "sessionId": "session_1762717999117", "maxResults": 100, "recipients": ["ashtekar@gmail.com"], "searchQuery": "synthetic biology, biotechnology, genetic engineering, mRNA, protein, molecular biology, cell biology, CRISPR, gene editing, biotechnology, genome", "relevancyThreshold": 0.2}	333f739d-3cdb-4a85-834b-fc3ea6b9b5da
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_profiles (id, email, name, role, created_at, updated_at, last_active_at, preferences) FROM stdin;
06677f7f-23b3-4716-89a0-279c95af1813	ashtekar2010@gmail.com	ashtekar2010@gmail.com	user	2025-11-06 02:22:42.378762+00	2025-11-08 20:32:00.211794+00	2025-11-08 20:31:59.994+00	{}
333f739d-3cdb-4a85-834b-fc3ea6b9b5da	ashtekar@gmail.com	ashtekar@gmail.com	admin	2025-11-04 18:53:42.51662+00	2025-11-10 02:20:16.609205+00	2025-11-10 02:20:16.534+00	{}
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id, user_id, session_token, expires_at, created_at, last_activity, ip_address, user_agent, active) FROM stdin;
a1daf397-2d41-4658-913a-08bd97ceeaab	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	3d7c61135176ca6b5ca70e587bb8637c920af2e0ee6fe41acebfc1c68ebb4439	2025-11-11 23:52:15.183+00	2025-11-04 23:52:15.42352+00	2025-11-04 23:52:16.135+00	24.23.241.131	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	t
f09f0a34-1635-4e79-86cf-4ec12d491072	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	3d5cce5f3c71c14ead1b273d2940e67a9e0c29bc36f350592173fb6293d62c46	2025-11-11 23:54:48.811+00	2025-11-04 23:54:49.05992+00	2025-11-04 23:54:50.304+00	24.23.241.131	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	t
e56a1db6-3677-4138-91a6-60e508b57179	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	bc02773e380ca07f9beaa559f838c5b4f243f97856c9a698ea8dd4fbe2c40d1f	2025-11-11 23:58:45.564+00	2025-11-04 23:58:45.782608+00	2025-11-10 00:31:34.275+00	24.23.241.131	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	t
fd7591b2-c934-4f5a-8375-74a0b9ad90a1	06677f7f-23b3-4716-89a0-279c95af1813	e7ec19d6209fd1fac001e30a978cedcaf4d2f883b935072c257b98a71b1f9732	2025-11-13 02:23:05.794+00	2025-11-06 02:23:06.096318+00	2025-11-10 01:54:44.651+00	172.59.161.254	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.7339.122 Mobile/15E148 Safari/604.1	t
1b3a4057-27e5-48a2-bfd2-2318414f08de	333f739d-3cdb-4a85-834b-fc3ea6b9b5da	8065fe09a3c949be0078e6dfb6a50666716de4aa99a110dc122431ed2fac3736	2025-11-15 03:58:07.485+00	2025-11-08 03:58:07.556423+00	2025-11-10 02:20:20.003+00	24.23.241.131	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/142.0.7444.128 Mobile/15E148 Safari/604.1	t
d2b2eba9-2f01-4503-83cc-d869dbf982fb	06677f7f-23b3-4716-89a0-279c95af1813	f47ae9e082254c8e638864041bd813e00358454d1953267f19c46e5057a29d5c	2025-11-15 03:54:25.706+00	2025-11-08 03:54:25.94683+00	2025-11-09 03:11:01.557+00	24.23.241.131	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-10-02 16:33:34
20211116045059	2025-10-02 16:33:36
20211116050929	2025-10-02 16:33:38
20211116051442	2025-10-02 16:33:39
20211116212300	2025-10-02 16:33:41
20211116213355	2025-10-02 16:33:43
20211116213934	2025-10-02 16:33:45
20211116214523	2025-10-02 16:33:47
20211122062447	2025-10-02 16:33:49
20211124070109	2025-10-02 16:33:51
20211202204204	2025-10-02 16:33:52
20211202204605	2025-10-02 16:33:54
20211210212804	2025-10-02 16:33:59
20211228014915	2025-10-02 16:34:01
20220107221237	2025-10-02 16:34:03
20220228202821	2025-10-02 16:34:05
20220312004840	2025-10-02 16:34:06
20220603231003	2025-10-02 16:34:09
20220603232444	2025-10-02 16:34:11
20220615214548	2025-10-02 16:34:13
20220712093339	2025-10-02 16:34:14
20220908172859	2025-10-02 16:34:16
20220916233421	2025-10-02 16:34:18
20230119133233	2025-10-02 16:34:19
20230128025114	2025-10-02 16:34:22
20230128025212	2025-10-02 16:34:24
20230227211149	2025-10-02 16:34:25
20230228184745	2025-10-02 16:34:27
20230308225145	2025-10-02 16:34:29
20230328144023	2025-10-02 16:34:30
20231018144023	2025-10-02 16:34:32
20231204144023	2025-10-02 16:34:35
20231204144024	2025-10-02 16:34:37
20231204144025	2025-10-02 16:34:38
20240108234812	2025-10-02 16:34:40
20240109165339	2025-10-02 16:34:42
20240227174441	2025-10-02 16:34:45
20240311171622	2025-10-02 16:34:47
20240321100241	2025-10-02 16:34:51
20240401105812	2025-10-02 16:34:56
20240418121054	2025-10-02 16:34:58
20240523004032	2025-10-02 16:35:05
20240618124746	2025-10-02 16:35:06
20240801235015	2025-10-02 16:35:08
20240805133720	2025-10-02 16:35:10
20240827160934	2025-10-02 16:35:11
20240919163303	2025-10-02 16:35:14
20240919163305	2025-10-02 16:35:15
20241019105805	2025-10-02 16:35:17
20241030150047	2025-10-02 16:35:24
20241108114728	2025-10-02 16:35:26
20241121104152	2025-10-02 16:35:28
20241130184212	2025-10-02 16:35:30
20241220035512	2025-10-02 16:35:32
20241220123912	2025-10-02 16:35:33
20241224161212	2025-10-02 16:35:35
20250107150512	2025-10-02 16:35:37
20250110162412	2025-10-02 16:35:38
20250123174212	2025-10-02 16:35:40
20250128220012	2025-10-02 16:35:42
20250506224012	2025-10-02 16:35:43
20250523164012	2025-10-02 16:35:45
20250714121412	2025-10-02 16:35:46
20250905041441	2025-10-02 16:35:48
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-10-02 16:33:30.120942
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-10-02 16:33:30.142757
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-10-02 16:33:30.149903
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-10-02 16:33:30.222041
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-10-02 16:33:30.309286
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-10-02 16:33:30.314641
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-10-02 16:33:30.320855
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-10-02 16:33:30.32513
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-10-02 16:33:30.329409
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-10-02 16:33:30.334138
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-10-02 16:33:30.340239
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-10-02 16:33:30.346749
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-10-02 16:33:30.356306
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-10-02 16:33:30.360384
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-10-02 16:33:30.364252
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-10-02 16:33:30.491655
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-10-02 16:33:30.5029
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-10-02 16:33:30.506385
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-10-02 16:33:30.512154
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-10-02 16:33:30.540462
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-10-02 16:33:30.544466
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-10-02 16:33:30.555035
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-10-02 16:33:30.581625
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-10-02 16:33:30.626236
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-10-02 16:33:30.633572
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-10-02 16:33:30.639375
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-10-02 16:33:30.64574
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-10-02 16:33:30.67843
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-10-02 16:33:31.035942
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-10-02 16:33:31.060933
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-10-02 16:33:31.092913
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-10-02 16:33:31.107338
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-10-02 16:33:32.704168
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-10-02 16:33:34.66898
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-10-02 16:33:34.670723
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-10-02 16:33:34.676192
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-10-02 16:33:34.680205
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-10-02 16:33:34.688699
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-10-02 16:33:34.694406
39	add-search-v2-sort-support	39cf7d1e6bf515f4b02e41237aba845a7b492853	2025-10-02 16:33:34.704699
40	fix-prefix-race-conditions-optimized	fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f	2025-10-02 16:33:34.708347
41	add-object-level-update-trigger	44c22478bf01744b2129efc480cd2edc9a7d60e9	2025-10-02 16:33:34.716284
42	rollback-prefix-triggers	f2ab4f526ab7f979541082992593938c05ee4b47	2025-10-02 16:33:34.720789
43	fix-object-level	ab837ad8f1c7d00cc0b7310e989a23388ff29fc6	2025-10-02 16:33:34.728464
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
\.


--
-- Data for Name: seed_files; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.seed_files (path, hash) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 8, true);


--
-- Name: email_recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_recipients_id_seq', 4, true);


--
-- Name: search_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.search_settings_id_seq', 12, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 16, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: article_summaries article_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_summaries
    ADD CONSTRAINT article_summaries_pkey PRIMARY KEY (id);


--
-- Name: article_summaries article_summaries_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_summaries
    ADD CONSTRAINT article_summaries_unique UNIQUE (article_id, thread_id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: daily_summaries daily_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_pkey PRIMARY KEY (id);


--
-- Name: daily_summaries daily_summaries_thread_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_thread_id_key UNIQUE (thread_id);


--
-- Name: email_recipients email_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT email_recipients_pkey PRIMARY KEY (id);


--
-- Name: search_settings search_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_settings
    ADD CONSTRAINT search_settings_pkey PRIMARY KEY (id);


--
-- Name: summary_evaluations summary_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summary_evaluations
    ADD CONSTRAINT summary_evaluations_pkey PRIMARY KEY (id);


--
-- Name: summary_evaluations summary_evaluations_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summary_evaluations
    ADD CONSTRAINT summary_evaluations_unique UNIQUE (summary_id, grader_email);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_unique UNIQUE (user_id);


--
-- Name: threads threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_pkey PRIMARY KEY (id);


--
-- Name: threads threads_user_run_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_user_run_date_key UNIQUE (user_id, run_date);


--
-- Name: user_profiles user_profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_email_key UNIQUE (email);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_token_key UNIQUE (session_token);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_article_summaries_article; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_article_summaries_article ON public.article_summaries USING btree (article_id);


--
-- Name: idx_article_summaries_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_article_summaries_created ON public.article_summaries USING btree (created_at DESC);


--
-- Name: idx_article_summaries_langsmith; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_article_summaries_langsmith ON public.article_summaries USING btree (langsmith_run_id);


--
-- Name: idx_article_summaries_thread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_article_summaries_thread ON public.article_summaries USING btree (thread_id);


--
-- Name: idx_article_summaries_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_article_summaries_user_id ON public.article_summaries USING btree (user_id);


--
-- Name: idx_daily_summaries_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_summaries_created ON public.daily_summaries USING btree (created_at DESC);


--
-- Name: idx_daily_summaries_langsmith; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_summaries_langsmith ON public.daily_summaries USING btree (langsmith_run_id);


--
-- Name: idx_daily_summaries_thread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_summaries_thread ON public.daily_summaries USING btree (thread_id);


--
-- Name: idx_email_recipients_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_recipients_user_id ON public.email_recipients USING btree (user_id);


--
-- Name: idx_summary_evaluations_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_summary_evaluations_created ON public.summary_evaluations USING btree (created_at DESC);


--
-- Name: idx_summary_evaluations_grader; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_summary_evaluations_grader ON public.summary_evaluations USING btree (grader_email);


--
-- Name: idx_summary_evaluations_summary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_summary_evaluations_summary ON public.summary_evaluations USING btree (summary_id);


--
-- Name: idx_summary_evaluations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_summary_evaluations_user_id ON public.summary_evaluations USING btree (user_id);


--
-- Name: idx_system_settings_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_settings_user_id ON public.system_settings USING btree (user_id);


--
-- Name: idx_threads_run_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_threads_run_date ON public.threads USING btree (run_date DESC);


--
-- Name: idx_threads_started_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_threads_started_at ON public.threads USING btree (started_at DESC);


--
-- Name: idx_threads_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_threads_status ON public.threads USING btree (status);


--
-- Name: idx_threads_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_threads_user_date ON public.threads USING btree (user_id, run_date DESC);


--
-- Name: idx_threads_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_threads_user_id ON public.threads USING btree (user_id);


--
-- Name: idx_user_profiles_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_email ON public.user_profiles USING btree (email);


--
-- Name: idx_user_profiles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_role ON public.user_profiles USING btree (role);


--
-- Name: idx_user_sessions_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_active ON public.user_sessions USING btree (active) WHERE (active = true);


--
-- Name: idx_user_sessions_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_expires ON public.user_sessions USING btree (expires_at);


--
-- Name: idx_user_sessions_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_token ON public.user_sessions USING btree (session_token);


--
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: user_profiles update_user_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: article_summaries article_summaries_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_summaries
    ADD CONSTRAINT article_summaries_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;


--
-- Name: article_summaries article_summaries_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_summaries
    ADD CONSTRAINT article_summaries_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.threads(id) ON DELETE CASCADE;


--
-- Name: article_summaries article_summaries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_summaries
    ADD CONSTRAINT article_summaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: daily_summaries daily_summaries_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_summaries
    ADD CONSTRAINT daily_summaries_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.threads(id) ON DELETE CASCADE;


--
-- Name: email_recipients email_recipients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT email_recipients_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: summary_evaluations summary_evaluations_summary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summary_evaluations
    ADD CONSTRAINT summary_evaluations_summary_id_fkey FOREIGN KEY (summary_id) REFERENCES public.article_summaries(id) ON DELETE CASCADE;


--
-- Name: summary_evaluations summary_evaluations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summary_evaluations
    ADD CONSTRAINT summary_evaluations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: system_settings system_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: threads threads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict vJawWgpP50mYE2f79leZxDk3UAmuiLcoLuYqmoEYjiapf1JJOyvSbTSqUTMBxiT

