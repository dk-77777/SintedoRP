CREATE TABLE profile_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id text NOT NULL REFERENCES "user"(id),
  profile_kind text NOT NULL CHECK(profile_kind IN ('trabalhador','PF','PJ')),
  terms_version text NOT NULL, accepted_at timestamptz NOT NULL DEFAULT now()
);
