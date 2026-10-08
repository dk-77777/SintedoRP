ALTER TABLE experience ADD COLUMN version integer NOT NULL DEFAULT 1 CHECK (version > 0);

-- Proposals are retained after refusal or agreement; only one can be pending.
CREATE TABLE experience_closure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experience(id),
  end_date date NOT NULL,
  proposed_by text NOT NULL REFERENCES "user"(id),
  worker_confirmed boolean NOT NULL DEFAULT false,
  employer_confirmed boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','Confirmada','Recusada')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by text REFERENCES "user"(id),
  CHECK ((status = 'Pendente') = (resolved_at IS NULL AND resolved_by IS NULL)),
  CHECK (status <> 'Confirmada' OR (worker_confirmed AND employer_confirmed))
);
CREATE UNIQUE INDEX experience_closure_pending ON experience_closure(experience_id) WHERE status='Pendente';
CREATE INDEX experience_closure_history ON experience_closure(experience_id,created_at DESC,id);
