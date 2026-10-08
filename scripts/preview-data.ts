import type { LiveState, JobRow, ReportRow } from "../src/live/types";
export type PreviewRole =
  | "publico"
  | "trabalhador"
  | "empregador"
  | "sindicato";
const uid = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const worker = "preview-worker";
const owner = "preview-employer";
const employerId = uid(1);
const jobs: JobRow[] = [
  {
    id: uid(10),
    title: "Organização e cuidado da casa",
    category: "Doméstica",
    salary_cents: 240000,
    period: "Mês",
    employer_id: employerId,
    employer_name: "Residência de exemplo",
    employer_type: "PF",
  },
  {
    id: uid(11),
    title: "Uma rotina de limpeza combinada",
    category: "Diarista",
    salary_cents: 18000,
    period: "Dia",
    employer_id: employerId,
    employer_name: "Residência de exemplo",
    employer_type: "PF",
  },
  {
    id: uid(12),
    title: "Cuidado e companhia no dia a dia",
    category: "Cuidador de idosos",
    salary_cents: 260000,
    period: "Mês",
    employer_id: uid(2),
    employer_name: "Empresa de exemplo",
    employer_type: "PJ",
  },
  {
    id: uid(13),
    title: "Acolhimento e cuidado com crianças",
    category: "Babá",
    salary_cents: 230000,
    period: "Mês",
    employer_id: employerId,
    employer_name: "Residência de exemplo",
    employer_type: "PF",
  },
].map((job, i) => ({
  ...job,
  status: i === 3 ? "Pendente" : "Publicada",
  version: 2,
  current_revision: 1,
  number: 1,
  revision_id: uid(50 + i),
  reason: null,
  published_at: i === 3 ? null : "2026-10-01T12:00:00Z",
  employer_verified: true,
  region: "Ribeirão Preto — Centro",
  schedule: "Segunda a sexta",
  hours: "8h às 17h, com intervalo",
  description:
    "Organização, cuidado e uma rotina definida em conjunto. Atividades, horários e condições combinados com respeito.",
  benefits: "Vale-transporte e alimentação no local.",
}));

export function previewState(role: PreviewRole): LiveState {
  const user =
    role === "publico"
      ? null
      : {
          id:
            role === "trabalhador"
              ? worker
              : role === "empregador"
                ? owner
                : "preview-staff",
          name:
            role === "trabalhador"
              ? "Marina · exemplo"
              : role === "empregador"
                ? "Ana · exemplo"
                : "Equipe sindical · exemplo",
          role,
          roles:
            role === "sindicato" ? ["ADMIN", "MODERATOR", "ANALYST"] : [role],
        };
  const participants = role === "trabalhador" || role === "empregador";
  const applications = [0, 2, 1]
    .map((jobIndex, index) => {
      const job = jobs[jobIndex];
      return {
        id: uid(100 + index),
        job_id: job.id,
        worker_id: worker,
        revision_id: job.revision_id,
        status: index === 1 ? "Entrevista" : "Contratação informada",
        version: 3,
        created_at: "2026-10-02T12:00:00Z",
        employer_id: job.employer_id,
        employer_name: job.employer_name,
        worker_name: "Marina · exemplo",
        title: job.title,
        salary_cents: job.salary_cents,
        period: job.period,
        schedule: job.schedule,
        hours: job.hours,
        region: job.region,
        revision_number: 1,
        category: "Doméstica",
        bio: "Experiência na organização da casa e no cuidado de pessoas.",
        availability: "Segunda a sexta",
      };
    })
    .filter((a) => role !== "empregador" || a.employer_id === employerId);
  const experiences: LiveState["experiences"] = [
    {
      id: uid(200),
      version: 3,
      worker_id: worker,
      employer_id: employerId,
      application_id: uid(100),
      employer_name: "Residência de exemplo",
      title: "Doméstica",
      start_date: "2026-10-01",
      end_date: null,
      origin: "Plataforma",
      worker_confirmed: true,
      employer_confirmed: true,
      contested: false,
      confirmed_at: "2026-10-02T12:00:00Z",
      closure_id: uid(250),
      closure_end_date: "2026-10-06",
      closure_status: "Pendente",
      closure_worker_confirmed: false,
      closure_employer_confirmed: true,
    },
    {
      id: uid(201),
      version: 4,
      worker_id: worker,
      employer_id: employerId,
      application_id: uid(102),
      employer_name: "Residência de exemplo",
      title: "Diarista",
      start_date: "2026-09-01",
      end_date: "2026-09-30",
      origin: "Plataforma",
      worker_confirmed: true,
      employer_confirmed: true,
      contested: false,
      confirmed_at: "2026-10-01T12:00:00Z",
      closure_id: null,
      closure_end_date: null,
      closure_status: null,
      closure_worker_confirmed: null,
      closure_employer_confirmed: null,
    },
  ];
  return {
    user,
    person:
      role === "trabalhador"
        ? {
            user_id: worker,
            region: "Ribeirão Preto — Centro",
            category: "Doméstica",
            availability: "Segunda a sexta",
            bio: "Experiência na organização da casa e no cuidado de pessoas. Busco uma rotina com diálogo e respeito.",
            verified: true,
          }
        : null,
    employers: [
      {
        id: employerId,
        name: "Residência de exemplo",
        type: "PF",
        region: "Ribeirão Preto — Centro",
        verified: true,
        owned: role === "empregador",
      },
      {
        id: uid(2),
        name: "Empresa de exemplo",
        type: "PJ",
        region: "Ribeirão Preto — Zona Sul",
        verified: false,
        owned: false,
      },
    ],
    jobs: jobs.filter(
      (j) =>
        j.status === "Publicada" ||
        role === "empregador" ||
        role === "sindicato",
    ),
    applications: participants ? applications : [],
    experiences: participants ? experiences : [],
    messages: participants
      ? [
          {
            id: uid(300),
            application_id: uid(100),
            sender_id: worker,
            text: "Olá! Podemos conversar sobre as atividades e os horários?",
            created_at: "2026-10-06T12:00:00Z",
            sender_name: "Marina · exemplo",
          },
          {
            id: uid(301),
            application_id: uid(100),
            sender_id: owner,
            text: "Claro! Vamos combinar uma conversa para alinhar todos os detalhes.",
            created_at: "2026-10-06T12:30:00Z",
            sender_name: "Ana · exemplo",
          },
        ]
      : [],
    reviews: [
      {
        id: uid(400),
        experience_id: uid(201),
        author_id: worker,
        employer_id: employerId,
        employer_name: "Residência de exemplo",
        rating: 5,
        text: "As condições combinadas foram respeitadas. Houve diálogo e boa comunicação durante o trabalho.",
        status: "Publicada",
        response: "Obrigada pela parceria e pelo cuidado.",
        moderation_reason: "Conteúdo analisado no exemplo.",
        created_at: "2026-10-03T12:00:00Z",
      },
    ],
    cases:
      role === "publico"
        ? []
        : [
            {
              id: uid(500),
              author_id: user!.id,
              title: "Apoio para alinhar condições",
              detail:
                "Gostaria de orientação sobre o registro dos horários combinados. Relato fictício para apresentação.",
              status: "Aberto",
              resolution: null,
              created_at: "2026-10-06T12:00:00Z",
            },
          ],
    accounts:
      role === "sindicato"
        ? [
            {
              id: worker,
              name: "Marina · exemplo",
              suspended: false,
              emailVerified: true,
              has_person: true,
              verified: true,
            },
            {
              id: owner,
              name: "Ana · exemplo",
              suspended: false,
              emailVerified: true,
              has_person: false,
              verified: null,
            },
          ]
        : [],
  };
}
export const previewReports: ReportRow[] = [
  {
    employer_id: employerId,
    name: "Residência de exemplo",
    type: "PF",
    region: "Ribeirão Preto — Centro",
    verified: true,
    published: 2,
    applications: 2,
    hires: 2,
    confirmed: 2,
    reviews: 1,
    average: 5,
  },
  {
    employer_id: uid(2),
    name: "Empresa de exemplo",
    type: "PJ",
    region: "Ribeirão Preto — Zona Sul",
    verified: false,
    published: 1,
    applications: 1,
    hires: 0,
    confirmed: 0,
    reviews: 0,
    average: null,
  },
];
export const previewViews: {
  role: PreviewRole;
  path: string;
  label: string;
  profileKind?: "trabalhador" | "PF" | "PJ";
}[] = [
  { role: "publico", path: "/", label: "Início" },
  { role: "publico", path: "/vagas", label: "Vagas" },
  { role: "publico", path: `/vagas/${uid(10)}`, label: "Detalhe da vaga" },
  { role: "publico", path: "/cadastro", label: "Cadastro" },
  { role: "publico", path: "/entrar", label: "Entrar" },
  { role: "publico", path: "/recuperar-acesso", label: "Recuperar acesso" },
  { role: "publico", path: "/como-funciona", label: "Como funciona" },
  { role: "publico", path: "/contato", label: "O sindicato" },
  { role: "publico", path: "/privacidade", label: "Privacidade" },
  { role: "trabalhador", path: "/trabalhador", label: "Painel do trabalhador" },
  {
    role: "trabalhador",
    path: "/cadastro/perfil?tipo=trabalhador",
    label: "Cadastro de perfil com CPF",
    profileKind: "trabalhador",
  },
  {
    role: "trabalhador",
    path: "/trabalhador/perfil",
    label: "Perfil profissional",
  },
  {
    role: "trabalhador",
    path: "/trabalhador/candidaturas",
    label: "Candidaturas",
  },
  { role: "trabalhador", path: "/mensagens", label: "Mensagens" },
  {
    role: "trabalhador",
    path: `/mensagens/${uid(100)}`,
    label: "Conversa privada",
  },
  {
    role: "trabalhador",
    path: "/trabalhador/historico",
    label: "Histórico e encerramento",
  },
  { role: "trabalhador", path: "/trabalhador/avaliacoes", label: "Avaliações" },
  { role: "trabalhador", path: "/atendimento", label: "Atendimento" },
  { role: "empregador", path: "/empregador", label: "Painel do empregador" },
  {
    role: "empregador",
    path: "/cadastro/perfil?tipo=PF",
    label: "Cadastro de empregador PF",
    profileKind: "PF",
  },
  {
    role: "empregador",
    path: "/cadastro/perfil?tipo=PJ",
    label: "Cadastro de empresa com CNPJ",
    profileKind: "PJ",
  },
  { role: "empregador", path: "/empregador/vagas", label: "Minhas vagas" },
  { role: "empregador", path: "/empregador/vagas/nova", label: "Nova vaga" },
  {
    role: "empregador",
    path: `/empregador/vagas/${uid(10)}/editar`,
    label: "Editar vaga",
  },
  {
    role: "empregador",
    path: "/empregador/candidatos",
    label: "Candidaturas recebidas",
  },
  { role: "empregador", path: "/mensagens", label: "Mensagens" },
  {
    role: "empregador",
    path: `/mensagens/${uid(100)}`,
    label: "Conversa privada",
  },
  { role: "empregador", path: "/empregador/historico", label: "Experiências" },
  {
    role: "empregador",
    path: "/empregador/avaliacoes",
    label: "Avaliações recebidas",
  },
  { role: "empregador", path: "/atendimento", label: "Atendimento" },
  { role: "sindicato", path: "/sindicato", label: "Painel do sindicato" },
  { role: "sindicato", path: "/sindicato/vagas", label: "Análise de vagas" },
  {
    role: "sindicato",
    path: `/sindicato/vagas/${uid(13)}`,
    label: "Analisar condições",
  },
  {
    role: "sindicato",
    path: "/sindicato/avaliacoes",
    label: "Moderação de avaliações",
  },
  {
    role: "sindicato",
    path: "/sindicato/atendimentos",
    label: "Atendimentos recebidos",
  },
  {
    role: "sindicato",
    path: "/sindicato/relatorios",
    label: "Relatório de empresas",
  },
  {
    role: "sindicato",
    path: "/sindicato/cadastros",
    label: "Cadastros e verificação",
  },
];
