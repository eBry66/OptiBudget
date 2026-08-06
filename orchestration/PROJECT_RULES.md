# Project Rules

This file is CONTENT. The template never overwrites it. Everything specific to
this project belongs here and nowhere else.

SENTINEL: <choose a short unguessable string, e.g. OB-7Q4-NEW>

## What this project is
<One paragraph. The authoritative statement is product/PRODUCT.md; this is the
one-line version an agent reads first.>

## Stack
<e.g. SvelteKit on Vercel, Supabase Postgres with Row Level Security.>

## Highest-risk area
<The one thing that must never be got wrong. For a finance app: RLS policies.
Any work touching it requires explicit HITL confirmation before implementation.>

## Project-specific constraints
- <e.g. No new runtime dependency without an ADR in engineering/adr/.>
- <e.g. All currency values are integer minor units. Never floats.>

## Vendors in use
- <e.g. Claude Code (implement), OpenAI Codex (review). The vendor that drafted
  an artifact must not review it.>
