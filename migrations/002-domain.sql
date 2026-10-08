CREATE TABLE role_grant (
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('trabalhador','empregador','ADMIN','MODERATOR','ANALYST')),
  granted_by text REFERENCES "user"(id), created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id, role)
);
CREATE TABLE person (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  document_hash text UNIQUE NOT NULL, document_cipher text NOT NULL,
  region text NOT NULL, category text NOT NULL, availability text NOT NULL, bio text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE employer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, type text NOT NULL CHECK(type IN ('PF','PJ')),
  document_hash text UNIQUE NOT NULL, document_cipher text NOT NULL,
  region text NOT NULL, verified boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE employer_member (
  employer_id uuid NOT NULL REFERENCES employer(id), user_id text NOT NULL REFERENCES "user"(id), PRIMARY KEY(employer_id,user_id)
);
CREATE TABLE job (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), employer_id uuid NOT NULL REFERENCES employer(id),
  status text NOT NULL DEFAULT 'Pendente' CHECK(status IN ('Pendente','Publicada','Ajustes','Encerrada')),
  version integer NOT NULL DEFAULT 1, current_revision integer NOT NULL DEFAULT 1, reason text,
  created_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz, closed_at timestamptz
);
CREATE TABLE job_revision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), job_id uuid NOT NULL REFERENCES job(id), number integer NOT NULL,
  title text NOT NULL, category text NOT NULL, region text NOT NULL,
  salary_cents integer NOT NULL CHECK(salary_cents>0), period text NOT NULL CHECK(period IN ('Mês','Dia','Hora')),
  schedule text NOT NULL, hours text NOT NULL, description text NOT NULL, benefits text NOT NULL,
  terms_version text NOT NULL, accepted_by text NOT NULL REFERENCES "user"(id), accepted_at timestamptz NOT NULL DEFAULT now(), UNIQUE(job_id,number)
);
CREATE TABLE moderation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), revision_id uuid NOT NULL REFERENCES job_revision(id),
  moderator_id text NOT NULL REFERENCES "user"(id), decision text NOT NULL, reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE application (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), job_id uuid NOT NULL REFERENCES job(id), worker_id text NOT NULL REFERENCES person(user_id),
  revision_id uuid NOT NULL REFERENCES job_revision(id), status text NOT NULL DEFAULT 'Enviada'
    CHECK(status IN ('Enviada','Em análise','Entrevista','Contratação informada','Não selecionada','Retirada')),
  version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(job_id,worker_id)
);
CREATE TABLE application_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), application_id uuid NOT NULL REFERENCES application(id),
  actor_id text NOT NULL REFERENCES "user"(id), status text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE message (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), application_id uuid NOT NULL REFERENCES application(id),
  sender_id text NOT NULL REFERENCES "user"(id), text text NOT NULL CHECK(length(text) BETWEEN 1 AND 2000), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), worker_id text NOT NULL REFERENCES person(user_id), employer_id uuid REFERENCES employer(id),
  application_id uuid UNIQUE REFERENCES application(id), employer_name text NOT NULL, title text NOT NULL,
  start_date date NOT NULL, end_date date, origin text NOT NULL CHECK(origin IN ('Autodeclarado','Plataforma')),
  employer_confirmed boolean NOT NULL DEFAULT false, worker_confirmed boolean NOT NULL DEFAULT false,
  contested boolean NOT NULL DEFAULT false, confirmed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK(end_date IS NULL OR end_date>=start_date)
);
CREATE TABLE review (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), experience_id uuid UNIQUE NOT NULL REFERENCES experience(id), author_id text NOT NULL REFERENCES "user"(id),
  rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5), text text NOT NULL,
  status text NOT NULL DEFAULT 'Em análise' CHECK(status IN ('Em análise','Publicada','Oculta','Contestada')),
  response text, response_by text REFERENCES "user"(id), moderation_reason text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE support_case (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), author_id text NOT NULL REFERENCES "user"(id), title text NOT NULL, detail text NOT NULL,
  application_id uuid REFERENCES application(id), experience_id uuid REFERENCES experience(id), review_id uuid REFERENCES review(id),
  status text NOT NULL DEFAULT 'Aberto' CHECK(status IN ('Aberto','Resolvido')), resolution text, resolved_by text REFERENCES "user"(id),
  created_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz
);
CREATE TABLE audit_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id text NOT NULL REFERENCES "user"(id), action text NOT NULL, resource text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE action_throttle (key text PRIMARY KEY, count integer NOT NULL, window_start timestamptz NOT NULL);
CREATE INDEX job_status_idx ON job(status,published_at);
CREATE INDEX job_employer_idx ON job(employer_id);
CREATE INDEX application_worker_idx ON application(worker_id,created_at);
CREATE INDEX message_application_idx ON message(application_id,created_at);
CREATE INDEX experience_worker_idx ON experience(worker_id);
CREATE INDEX audit_time_idx ON audit_event(created_at);
