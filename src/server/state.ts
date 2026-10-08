import { rows } from "./db";
import { actorFor, HttpError, type Actor } from "./security";
import type {
  JobRow,
  EmployerRow,
  PersonRow,
  ApplicationRow,
  MessageRow,
  ExperienceRow,
  ReviewRow,
  CaseRow,
  AccountRow,
  LiveState,
} from "../live/types";
export async function readState(headers: Headers): Promise<LiveState> {
  let actor: Actor | null = null;
  try {
    actor = await actorFor(headers);
  } catch (error) {
    if (!(error instanceof HttpError && error.status === 401)) throw error;
  }
  const uid = actor?.id ?? "";
  const mod = !!actor?.roles.some((r) => ["ADMIN", "MODERATOR"].includes(r));
  const admin = !!actor?.roles.includes("ADMIN");
  const jobs = await rows<JobRow>(
    `SELECT j.id,j.employer_id,j.status,j.version,j.current_revision,j.reason,j.published_at,
    e.name employer_name,e.type employer_type,e.verified employer_verified,r.id revision_id,r.title,r.category,r.region,r.salary_cents,r.period,r.schedule,r.hours,r.description,r.benefits,r.number
    FROM job j JOIN employer e ON e.id=j.employer_id JOIN job_revision r ON r.job_id=j.id AND r.number=j.current_revision
    WHERE j.status='Publicada' OR $2 OR EXISTS(SELECT 1 FROM employer_member m WHERE m.employer_id=j.employer_id AND m.user_id=$1)
    ORDER BY j.created_at DESC`,
    [uid, mod],
  );
  const publicReviews =
    await rows<ReviewRow>(`SELECT r.id,r.experience_id,e.employer_id,p.name employer_name,r.rating,r.text,r.status,r.response,r.moderation_reason,r.created_at
    FROM review r JOIN experience e ON e.id=r.experience_id JOIN employer p ON p.id=e.employer_id
    WHERE r.status='Publicada' ORDER BY r.created_at DESC`);
  const empty: LiveState = {
    user: actor,
    person: null,
    employers: [],
    jobs,
    applications: [],
    messages: [],
    experiences: [],
    reviews: publicReviews,
    cases: [],
    accounts: [],
  };
  if (!actor) return empty;
  const scope = `(a.worker_id=$1 OR EXISTS(SELECT 1 FROM employer_member m WHERE m.employer_id=j.employer_id AND m.user_id=$1))`;
  const results = await Promise.all([
    rows<PersonRow>(
      "SELECT user_id,region,category,availability,bio,verified FROM person WHERE user_id=$1",
      [uid],
    ),
    rows<EmployerRow>(
      `SELECT e.id,e.name,e.type,e.region,e.verified,EXISTS(SELECT 1 FROM employer_member m WHERE m.employer_id=e.id AND m.user_id=$1) owned FROM employer e WHERE $2 OR EXISTS(SELECT 1 FROM employer_member m WHERE m.employer_id=e.id AND m.user_id=$1) ORDER BY e.name`,
      [uid, admin],
    ),
    rows<ApplicationRow>(
      `SELECT a.*,j.employer_id,e.name employer_name,u.name worker_name,r.title,r.salary_cents,r.period,r.schedule,r.hours,r.region,r.number revision_number,p.category,p.bio,p.availability
      FROM application a JOIN job j ON j.id=a.job_id JOIN employer e ON e.id=j.employer_id JOIN "user" u ON u.id=a.worker_id JOIN person p ON p.user_id=a.worker_id JOIN job_revision r ON r.id=a.revision_id
      WHERE ${scope} ORDER BY a.created_at DESC`,
      [uid],
    ),
    rows<MessageRow>(
      `SELECT m.id,m.application_id,m.sender_id,m.text,m.created_at,u.name sender_name FROM message m JOIN application a ON a.id=m.application_id JOIN job j ON j.id=a.job_id JOIN "user" u ON u.id=m.sender_id WHERE ${scope} ORDER BY m.created_at`,
      [uid],
    ),
    rows<ExperienceRow>(
      `SELECT e.id,e.version,e.worker_id,e.employer_id,e.application_id,e.employer_name,e.title,to_char(e.start_date,'YYYY-MM-DD') start_date,to_char(e.end_date,'YYYY-MM-DD') end_date,e.origin,e.worker_confirmed,e.employer_confirmed,e.contested,e.confirmed_at,
      c.id closure_id,to_char(c.end_date,'YYYY-MM-DD') closure_end_date,c.status closure_status,c.worker_confirmed closure_worker_confirmed,c.employer_confirmed closure_employer_confirmed
      FROM experience e LEFT JOIN LATERAL (SELECT * FROM experience_closure WHERE experience_id=e.id ORDER BY created_at DESC,id DESC LIMIT 1) c ON true
      WHERE e.worker_id=$1 OR EXISTS(SELECT 1 FROM employer_member m WHERE m.employer_id=e.employer_id AND m.user_id=$1) ORDER BY e.start_date DESC`,
      [uid],
    ),
    rows<ReviewRow>(
      `SELECT r.*,e.employer_id,p.name employer_name FROM review r JOIN experience e ON e.id=r.experience_id JOIN employer p ON p.id=e.employer_id
      WHERE $2 OR r.author_id=$1 OR EXISTS(SELECT 1 FROM employer_member m WHERE m.employer_id=e.employer_id AND m.user_id=$1) ORDER BY r.created_at DESC`,
      [uid, mod],
    ),
    rows<CaseRow>(
      "SELECT id,author_id,title,detail,status,resolution,created_at FROM support_case WHERE author_id=$1 OR $2 ORDER BY created_at DESC",
      [uid, mod],
    ),
    admin
      ? rows<AccountRow>(
          'SELECT u.id,u.name,u.suspended,u."emailVerified",p.user_id IS NOT NULL has_person,p.verified FROM "user" u LEFT JOIN person p ON p.user_id=u.id ORDER BY u."createdAt" DESC',
        )
      : Promise.resolve([]),
  ]);
  const [
    persons,
    employers,
    applications,
    messages,
    experiences,
    reviews,
    cases,
    accounts,
  ] = results;
  return {
    ...empty,
    person: persons[0] ?? null,
    employers,
    applications,
    messages,
    experiences,
    reviews: [
      ...reviews,
      ...publicReviews.filter(
        (r) => !reviews.some((other) => other.id === r.id),
      ),
    ],
    cases,
    accounts,
  };
}
