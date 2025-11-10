## Article ID Migration Plan

This document walks through migrating existing rows in Supabase from the legacy truncated Base64 article IDs to the new collision-resistant SHA-256 IDs introduced in `AN-17`.

### Objectives

- Recompute deterministic IDs for every article using `article_${sha256(url)}`.
- Update all dependent tables (e.g. `article_summaries`) without breaking foreign key constraints.
- Preserve historical rows and avoid losing summaries that collided previously.

### Assumptions

- Tables involved: `articles` (primary id), `article_summaries` (child table referencing `articles.id`). Search for additional foreign keys referencing `articles.id` before running these commands and extend the script accordingly.
- Supabase project already has the `pgcrypto` extension available (required for `digest()`).

### High-Level Strategy

1. **Stage new columns** for the recalculated IDs so reads can continue during the backfill.
2. **Backfill new IDs** deterministically from existing data.
3. **Validate** counts and uniqueness before swapping columns.
4. **Atomically swap** the new columns into place and recreate constraints.

### SQL Migration (run inside a transaction)

> ⚠️ Back up the affected tables first or run in a shadow database.  
> ⚠️ If other tables reference `articles.id`, add equivalent `ALTER TABLE` blocks for them.

```sql
begin;

-- Ensure hashing support
create extension if not exists pgcrypto;

-- 1. Stage new ID columns
alter table public.articles add column if not exists new_id text;
alter table public.article_summaries add column if not exists new_article_id text;

-- 2. Backfill hashes using deterministic SHA-256 over the canonical URL
update public.articles
set new_id = 'article_' || encode(digest(url, 'sha256'), 'hex')
where new_id is null;

-- Some collided rows might exist because of the previous truncation.
-- Investigate duplicates (should be zero after this step):
-- select new_id, count(*) from public.articles group by new_id having count(*) > 1;

-- 3. Propagate new IDs to summaries
update public.article_summaries s
set new_article_id = a.new_id
from public.articles a
where s.article_id = a.id and (s.new_article_id is distinct from a.new_id);

-- Optional sanity checks (run outside transaction if desired):
-- select count(*) from public.articles where new_id is null;
-- select count(*) from public.article_summaries where new_article_id is null;

-- 4. Swap columns (drop/recreate constraints as needed)
alter table public.article_summaries drop constraint if exists article_summaries_article_id_fkey;
alter table public.articles drop constraint if exists articles_pkey;

alter table public.article_summaries drop column article_id;
alter table public.article_summaries rename column new_article_id to article_id;

alter table public.articles drop column id;
alter table public.articles rename column new_id to id;

alter table public.articles add primary key (id);
alter table public.article_summaries
  add constraint article_summaries_article_id_fkey
  foreign key (article_id) references public.articles(id) on update cascade on delete cascade;

-- Optional: tighten uniqueness guarantees
create unique index if not exists articles_id_unique on public.articles(id);
create unique index if not exists articles_url_unique on public.articles(url);

commit;
```

### Post-Migration Tasks

- Run `select count(*)` comparisons before/after to ensure no rows were lost.
- Spot-check several known articles to confirm their IDs now match the SHA-256 approach (see regression test in `SearchTools.test.ts`).
- Update any cached data or downstream systems (e.g. analytics) that store the legacy IDs.
- Monitor logs on the next daily summary job run for duplicate insert warnings—there should be none.

### Rollback Plan

Because the migration replaces the primary key, the simplest rollback is to restore the pre-migration snapshot. If that is not possible, you can keep a copy of the original IDs before dropping them by backing them up to a temporary column or table and reversing the rename steps.

### Supabase UUIDs vs Synthetic Hash IDs

| Approach | Pros | Cons | When to Prefer |
| --- | --- | --- | --- |
| Supabase-generated `uuid` default | Built-in, automatically unique, no hashing logic required; integrates with Supabase dashboards and Row Level Security defaults; avoids long string primary keys. | Not deterministic from URL; requires additional unique constraint on `url` to enforce idempotency; migrating existing consumers off `article_*` strings could be disruptive. | When you do not need to derive IDs from URLs and are comfortable relying on database uniqueness guarantees. |
| Synthetic SHA-256 hash of URL (`article_${hash}`) | Deterministic and idempotent: same URL always maps to same ID; simplifies debugging and replaying jobs; easy to recompute offline; backwards compatible with existing `article_*` format. | Requires application code to compute; relies on canonical URL normalization; hashes are longer strings (71 chars) which can bloat indexes slightly. | When workflows depend on deterministic IDs or you need to upsert by URL without extra round-trips. |

**Hybrid option:** keep the SHA-256 hash in a unique column (or unique constraint on `url`) while promoting the Supabase UUID to primary key. This gives deterministic lookups plus default Supabase ergonomics at the cost of an extra column.
