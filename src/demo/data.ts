export type Role = "trabalhador" | "empregador" | "sindicato";
export type JobStatus =
  | "Publicada"
  | "Pendente"
  | "Ajustes solicitados"
  | "Rejeitada"
  | "Suspensa"
  | "Encerrada";
export type ApplicationStatus =
  | "Enviada"
  | "Em análise"
  | "Contato iniciado"
  | "Proposta enviada"
  | "Contratação informada"
  | "Não selecionada"
  | "Desistiu";
export type Job = {
  id: string;
  title: string;
  employer: string;
  region: string;
  category: string;
  salary: number;
  period: "mês" | "dia";
  schedule: string;
  hours: string;
  description: string;
  benefits: string;
  status: JobStatus;
  owned: boolean;
  revision: number;
  reason?: string;
  date: string;
};
export type Application = {
  id: string;
  jobId: string;
  workerId: string;
  worker: string;
  status: ApplicationStatus;
  revision: number;
  date: string;
};
export type Message = {
  id: string;
  applicationId: string;
  sender: Role;
  text: string;
};
export type Experience = {
  id: string;
  employer: string;
  title: string;
  date: string;
  confirmed: boolean;
  ended: boolean;
  rating?: number;
  review?: string;
};
export type DemoState = {
  role: Role | null;
  jobs: Job[];
  applications: Application[];
  messages: Message[];
  profile: {
    name: string;
    region: string;
    category: string;
    availability: string;
    bio: string;
  };
  employer: { name: string; type: "PF" | "PJ"; region: string };
  experiences: Experience[];
  cases: { id: string; title: string; detail: string; status: string }[];
  team: { id: string; name: string; role: string; status: string }[];
};

export const categories = [
  "Empregada doméstica",
  "Diarista",
  "Cuidador(a)",
  "Babá",
  "Cozinheiro(a)",
];
export const regions = [
  "Centro",
  "Ribeirânia",
  "Jardim Paulista",
  "Zona Sul",
  "Zona Norte",
];
export const statusClass: Record<string, string> = {
  Publicada: "green",
  Pendente: "amber",
  "Ajustes solicitados": "amber",
  Rejeitada: "red",
  Encerrada: "gray",
  Suspensa: "red",
  Enviada: "blue",
  "Em análise": "amber",
  "Contato iniciado": "green",
  "Proposta enviada": "blue",
  "Contratação informada": "green",
  "Não selecionada": "gray",
  Desistiu: "gray",
};
export const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

export function initialState(): DemoState {
  return {
    role: null,
    jobs: [
      {
        id: "vaga-1",
        title: "Um novo começo, em uma casa acolhedora",
        category: "Empregada doméstica",
        employer: "Família Oliveira · exemplo",
        region: "Ribeirânia",
        salary: 2400,
        period: "mês",
        schedule: "Segunda a sexta",
        hours: "8h às 17h, com intervalo de 1h",
        description:
          "Organização e limpeza dos ambientes, cuidados com roupas e preparo de refeições simples. Procuramos uma relação de trabalho respeitosa e duradoura.",
        benefits: "Vale-transporte e alimentação no local",
        status: "Publicada",
        owned: true,
        revision: 1,
        date: "2026-10-05",
      },
      {
        id: "vaga-2",
        title: "Cuidado e companhia no dia a dia",
        category: "Cuidador(a)",
        employer: "Família Almeida · exemplo",
        region: "Jardim Paulista",
        salary: 2700,
        period: "mês",
        schedule: "Segunda a sexta",
        hours: "9h às 18h, com intervalo de 1h",
        description:
          "Apoio nas atividades diárias e companhia para uma pessoa idosa. A rotina e as responsabilidades serão combinadas no contato inicial.",
        benefits: "Vale-transporte e alimentação no local",
        status: "Publicada",
        owned: false,
        revision: 1,
        date: "2026-10-04",
      },
      {
        id: "vaga-3",
        title: "Seu capricho faz a diferença",
        category: "Diarista",
        employer: "Família Santos · exemplo",
        region: "Zona Sul",
        salary: 180,
        period: "dia",
        schedule: "Duas diárias por semana",
        hours: "Horário a combinar",
        description:
          "Limpeza e organização de residência. Os dias de atendimento serão combinados com antecedência, respeitando a disponibilidade de ambas as partes.",
        benefits: "Transporte combinado por atendimento",
        status: "Publicada",
        owned: false,
        revision: 1,
        date: "2026-10-03",
      },
      {
        id: "vaga-4",
        title: "Atenção e carinho para os pequenos",
        category: "Babá",
        employer: "Família Oliveira · exemplo",
        region: "Centro",
        salary: 2500,
        period: "mês",
        schedule: "Segunda a sexta",
        hours: "8h às 17h, com intervalo de 1h",
        description:
          "Acompanhamento da rotina infantil e organização dos espaços utilizados pelas crianças. Atividades serão definidas em conjunto.",
        benefits: "Vale-transporte e alimentação no local",
        status: "Pendente",
        owned: true,
        revision: 1,
        date: "2026-10-06",
      },
    ],
    applications: [
      {
        id: "cand-1",
        jobId: "vaga-2",
        workerId: "demo-worker",
        worker: "Marina Costa · exemplo",
        status: "Em análise",
        revision: 1,
        date: "2026-10-06",
      },
      {
        id: "cand-2",
        jobId: "vaga-1",
        workerId: "demo-other",
        worker: "Luciana Silva · exemplo",
        status: "Enviada",
        revision: 1,
        date: "2026-10-05",
      },
    ],
    messages: [
      {
        id: "msg-1",
        applicationId: "cand-1",
        sender: "empregador",
        text: "Olá, Marina! Recebemos sua candidatura. Qual seria um bom horário para conversarmos sobre a oportunidade?",
      },
    ],
    profile: {
      name: "Marina Costa · exemplo",
      region: "Ribeirânia",
      category: "Empregada doméstica",
      availability: "Segunda a sexta",
      bio: "Tenho experiência com organização de ambientes e cuidado com as rotinas de uma casa. Busco uma oportunidade com diálogo e respeito.",
    },
    employer: {
      name: "Família Oliveira · exemplo",
      type: "PF",
      region: "Ribeirânia",
    },
    experiences: [
      {
        id: "exp-1",
        employer: "Família Pereira · exemplo",
        title: "Empregada doméstica",
        date: "Jan. 2024 — Dez. 2025",
        confirmed: true,
        ended: true,
      },
      {
        id: "exp-2",
        employer: "Experiência autodeclarada · exemplo",
        title: "Diarista",
        date: "Mar. 2023 — Dez. 2023",
        confirmed: false,
        ended: true,
      },
    ],
    cases: [
      {
        id: "caso-1",
        title: "Dúvida sobre condições de uma vaga",
        detail: "Atendimento fictício para demonstrar a mediação do sindicato.",
        status: "Aberto",
      },
    ],
    team: [
      {
        id: "equipe-1",
        name: "Equipe de demonstração",
        role: "Administrador",
        status: "Ativo",
      },
      {
        id: "equipe-2",
        name: "Moderação · exemplo",
        role: "Moderador",
        status: "Ativo",
      },
    ],
  };
}
