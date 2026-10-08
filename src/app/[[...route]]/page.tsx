import { Prototype } from "@/components/prototype";
import { LiveApplication } from "@/live/application";
import { Suspense } from "react";
import { connection } from "next/server";

export default async function Page({
  params,
}: {
  params: Promise<{ route?: string[] }>;
}) {
  const { route = [] } = await params;
  await connection();
  const demo = route[0] === "demo" && process.env.ENABLE_DEMO === "true";
  if (demo || process.env.APP_MODE === "prototype")
    return <Prototype path={"/" + (demo ? route.slice(1) : route).join("/")} />;
  return (
    <Suspense fallback={<p role="status">Preparando sua conexão…</p>}>
      <LiveApplication
        path={"/" + route.join("/")}
        demoEnabled={process.env.ENABLE_DEMO === "true"}
      />
    </Suspense>
  );
}
