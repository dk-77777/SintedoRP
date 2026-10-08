import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import nodemailer from "nodemailer";
import { pool } from "./db";

async function sendMail(email: string, subject: string, url: string) {
  if (!process.env.SMTP_URL || !process.env.MAIL_FROM)
    throw new Error("Serviço de e-mail não configurado");
  await nodemailer.createTransport(process.env.SMTP_URL).sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject,
    text: `${subject}\n\nAbra este link para continuar:\n${url}\n\nSe você não solicitou esta mensagem, ignore-a.`,
  });
}

function createAuth() {
  for (const name of ["DATABASE_URL", "BETTER_AUTH_URL", "BETTER_AUTH_SECRET"])
    if (!process.env[name]) throw new Error(`Configuração ausente: ${name}`);
  return betterAuth({
    appName: "Conecta SINTEDORP",
    database: pool,
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: process.env.BETTER_AUTH_URL
      ? [process.env.BETTER_AUTH_URL]
      : [],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await sendMail(
          user.email,
          "Redefina sua senha — Conecta SINTEDORP",
          url,
        );
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: false,
      expiresIn: 3600,
      sendVerificationEmail: async ({ user, url }) => {
        await sendMail(
          user.email,
          "Confirme seu e-mail — Conecta SINTEDORP",
          url,
        );
      },
    },
    user: {
      additionalFields: {
        currentRole: {
          type: "string",
          defaultValue: "trabalhador",
          input: false,
        },
        suspended: { type: "boolean", defaultValue: false, input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (user.name.length > 100 || user.email.length > 254)
              throw new APIError("BAD_REQUEST", {
                message: "Nome ou e-mail muito longo.",
              });
            return { data: user };
          },
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 40,
      customRules: {
        "/sign-in/email": { window: 60, max: 8 },
        "/sign-up/email": { window: 60, max: 5 },
        "/request-password-reset": { window: 60, max: 4 },
      },
    },
    // Sem proxy definido, não confie em cabeçalhos de IP enviados pelo cliente.
    advanced: {
      ipAddress: {
        ipAddressHeaders: process.env.TRUSTED_IP_HEADER
          ? [process.env.TRUSTED_IP_HEADER]
          : [],
      },
    },
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  return (instance ??= createAuth());
}
