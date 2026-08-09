# ITDoc AI — Database Schema

**Document Version:** 1.0  
**Project Version:** v0.2.0  
**Status:** Design / Planned  
**Database:** PostgreSQL  
**Backend Platform:** Supabase

---

## 1. Purpose

This document defines the planned database structure for ITDoc AI.

The database will store:

- User accounts
- IT support tickets
- Generated knowledge base articles
- AI generation records
- Reusable ticket templates
- Application activity logs

The schema is designed for PostgreSQL and is intended to be implemented using Supabase.

---

## 2. Database Design Principles

The database follows these principles:

1. Each table has a clearly defined responsibility.
2. Every primary entity uses a UUID as its identifier.
3. Relationships between entities use foreign keys.
4. User-owned data is associated with a user ID.
5. AI provider/model information is stored with AI generation records rather than hard-coded into the application database structure.
6. Timestamps are stored for important records.
7. The schema should support future authentication, history, search, and analytics features.
8. Sensitive credentials and API keys must never be stored in database tables.

---

# 3. Entity Overview

The initial database consists of six tables:

| Table | Purpose |
|---|---|
| `users` | Stores application user information |
| `tickets` | Stores IT support tickets and generated documentation |
| `knowledge_base_articles` | Stores reusable knowledge base articles |
| `ai_generations` | Stores metadata about AI generation requests |
| `templates` | Stores reusable ticket templates |
| `activity_logs` | Stores important user/application actions |

---

# 4. Table: users

## Purpose

Stores information about users who access ITDoc AI.

Authentication credentials should be managed by Supabase Auth rather than stored directly in this table.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique user identifier |
| `full_name` | TEXT | Nullable | User's display name |
| `email` | TEXT | Nullable | User email address |
| `role` | TEXT | Default: `user` | Application role |
| `created_at` | TIMESTAMPTZ | Default: `now()` | Account creation time |
| `updated_at` | TIMESTAMPTZ | Default: `now()` | Last profile update time |

## Notes

The `id` should correspond to the authenticated user's Supabase Auth ID.

Passwords must not be stored in this table.

---

# 5. Table: tickets

## Purpose

Stores IT support tickets and the documentation generated from technician notes.

This is the primary application table.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique ticket identifier |
| `user_id` | UUID | Foreign Key → `users.id` | User who created the ticket |
| `ticket_number` | TEXT | Nullable | Optional external ticket/reference number |
| `issue_title` | TEXT | Nullable | Ticket or issue title |
| `technician_notes` | TEXT | Required | Raw technician notes entered by the user |
| `generated_summary` | TEXT | Nullable | AI-generated issue summary |
| `generated_symptoms` | TEXT | Nullable | AI-generated symptoms |
| `generated_troubleshooting` | TEXT | Nullable | AI-generated troubleshooting steps |
| `generated_resolution` | TEXT | Nullable | AI-generated resolution |
| `status` | TEXT | Default: `draft` | Ticket status |
| `created_at` | TIMESTAMPTZ | Default: `now()` | Creation time |
| `updated_at` | TIMESTAMPTZ | Default: `now()` | Last update time |

## Suggested Status Values

```text
draft
generated
reviewed
resolved
archived
```

## Notes

`technician_notes` represents the original input.

The generated fields represent AI-assisted output that the technician can review and edit.

The application should not assume that AI-generated content is automatically correct.

---

# 6. Table: knowledge_base_articles

## Purpose

Stores reusable knowledge base articles generated from IT support tickets.

A KB article may optionally be linked to the ticket from which it was created.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique KB article identifier |
| `user_id` | UUID | Foreign Key → `users.id` | User who created the article |
| `ticket_id` | UUID | Foreign Key → `tickets.id`, Nullable | Source ticket |
| `title` | TEXT | Required | KB article title |
| `problem_statement` | TEXT | Nullable | Description of the problem |
| `environment` | TEXT | Nullable | Relevant system/environment information |
| `symptoms` | TEXT | Nullable | Observable symptoms |
| `resolution` | TEXT | Nullable | Resolution steps |
| `additional_notes` | TEXT | Nullable | Additional information |
| `keywords` | TEXT[] | Nullable | Searchable keywords |
| `status` | TEXT | Default: `draft` | Article status |
| `created_at` | TIMESTAMPTZ | Default: `now()` | Creation time |
| `updated_at` | TIMESTAMPTZ | Default: `now()` | Last update time |

## Suggested Status Values

```text
draft
reviewed
published
archived
```

---

# 7. Table: ai_generations

## Purpose

Stores metadata about AI generation requests.

This table helps track which provider and model generated content and provides a foundation for future AI usage analytics.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique generation identifier |
| `user_id` | UUID | Foreign Key → `users.id` | User who initiated generation |
| `ticket_id` | UUID | Foreign Key → `tickets.id`, Nullable | Related ticket |
| `provider` | TEXT | Required | AI provider, e.g. Groq |
| `model` | TEXT | Required | AI model used |
| `generation_type` | TEXT | Required | Type of generation |
| `prompt_version` | TEXT | Nullable | Version of application prompt |
| `input_tokens` | INTEGER | Nullable | Input token count if available |
| `output_tokens` | INTEGER | Nullable | Output token count if available |
| `generation_time_ms` | INTEGER | Nullable | Generation duration |
| `created_at` | TIMESTAMPTZ | Default: `now()` | Generation time |

## Suggested Generation Types

```text
ticket_documentation
knowledge_base
```

## Notes

This table stores metadata rather than API credentials.

API keys must never be stored here.

---

# 8. Table: templates

## Purpose

Stores reusable ticket templates that help technicians structure common IT support issues.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique template identifier |
| `user_id` | UUID | Foreign Key → `users.id`, Nullable | Template owner; null may indicate a system template |
| `name` | TEXT | Required | Template name |
| `category` | TEXT | Nullable | Template category |
| `template_text` | TEXT | Required | Template content/instructions |
| `is_system_template` | BOOLEAN | Default: `false` | Indicates built-in template |
| `created_at` | TIMESTAMPTZ | Default: `now()` | Creation time |
| `updated_at` | TIMESTAMPTZ | Default: `now()` | Last update time |

## Example Templates

```text
Password Reset
Outlook Issue
VPN Connection Issue
Printer Issue
Microsoft 365 Issue
Network Connectivity Issue
```

---

# 9. Table: activity_logs

## Purpose

Stores important application actions for auditing and future activity/history features.

## Columns

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key | Unique log identifier |
| `user_id` | UUID | Foreign Key → `users.id` | User performing the action |
| `action` | TEXT | Required | Action performed |
| `entity_type` | TEXT | Nullable | Type of affected record |
| `entity_id` | UUID | Nullable | ID of affected record |
| `metadata` | JSONB | Nullable | Additional structured information |
| `created_at` | TIMESTAMPTZ | Default: `now()` | Time of action |

## Example Actions

```text
ticket_created
ticket_updated
ticket_generated
kb_created
kb_updated
ai_generation_requested
template_created
ticket_deleted
kb_deleted
```

---

# 10. Relationships

The primary relationships are:

```text
users
  │
  ├──< tickets
  │       │
  │       ├──< knowledge_base_articles
  │       │
  │       └──< ai_generations
  │
  ├──< knowledge_base_articles
  │
  ├──< ai_generations
  │
  ├──< templates
  │
  └──< activity_logs
```

The `<` symbol represents a one-to-many relationship.

For example:

One user can create many tickets.

---

# 11. Relationship Details

### User → Tickets

```text
users.id
     ↓
tickets.user_id
```

One user can own multiple tickets.

---

### Ticket → Knowledge Base Article

```text
tickets.id
     ↓
knowledge_base_articles.ticket_id
```

A knowledge base article can optionally reference the ticket from which it was generated.

The relationship is optional because KB articles may eventually be created independently.

---

### Ticket → AI Generations

```text
tickets.id
     ↓
ai_generations.ticket_id
```

One ticket may have multiple AI generation records.

This allows the application to regenerate or improve documentation without losing the history of previous generation requests.

---

### User → Templates

```text
users.id
     ↓
templates.user_id
```

Users may have their own templates.

System templates can have a null `user_id` and `is_system_template = true`.

---

### User → Activity Logs

```text
users.id
     ↓
activity_logs.user_id
```

A user's important actions can be recorded in the activity log.

---

# 12. Data Ownership

Each user's application data should be associated with their `user_id`.

The application should eventually use Supabase Row Level Security (RLS) to ensure that users can only access records they are authorized to access.

Example:

```text
User A
  │
  ├── Ticket A1
  └── Ticket A2

User B
  │
  ├── Ticket B1
  └── Ticket B2
```

User A must not be able to access User B's tickets.

---

# 13. Security Considerations

The following rules apply:

- Never store API keys in database tables.
- Never commit API keys to GitHub.
- Use environment variables/secrets for API credentials.
- Use Supabase Auth for authentication.
- Use Row Level Security for user-owned data.
- Validate user input before sending it to AI services.
- Treat AI-generated content as draft content requiring user review.
- Avoid storing unnecessary sensitive information in technician notes.

---

# 14. AI Provider Independence

The database should not depend on a specific AI provider.

For example:

```text
provider = "groq"
model = "selected-model"
```

If the project later switches to another provider, the database structure should not need to change.

The `provider` and `model` fields in `ai_generations` make this possible.

---

# 15. Future Schema Extensions

The following tables/features may be added later if the application requires them:

- User preferences
- Organizations
- Teams
- Comments
- Attachments
- Export history
- AI prompt versions
- Usage limits
- Subscription information
- Notifications
- Full-text search indexes

These are intentionally excluded from the initial implementation to avoid unnecessary complexity.

---

# 16. Initial Implementation Priority

### Phase 1 — v0.2.0

Implement:

- `users`
- `tickets`
- `knowledge_base_articles`
- `ai_generations`

### Phase 2

Implement:

- `templates`
- `activity_logs`

### Phase 3

Add additional tables only when the corresponding application feature is implemented.

---

# 17. Important Design Decision

The database should support the application's current requirements without attempting to implement every possible future feature.

The schema is therefore intentionally designed to be:

- Simple
- Relational
- Extensible
- Secure
- Provider-independent
- Suitable for Supabase/PostgreSQL
