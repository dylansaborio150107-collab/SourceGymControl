import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SourceGymControl — Gestión integral de gimnasios" },
      {
        name: "description",
        content:
          "Panel SourceGymControl: clientes, membresías, accesos, pagos, rutinas, progreso físico y reportes del gimnasio.",
      },
      { property: "og:title", content: "SourceGymControl — Gestión integral de gimnasios" },
      {
        property: "og:description",
        content:
          "Panel SourceGymControl: clientes, membresías, accesos, pagos, rutinas, progreso físico y reportes del gimnasio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/app/index.html");
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">SourceGymControl</h1>
        <p className="mt-2 text-sm text-muted-foreground">Abriendo el panel del gimnasio…</p>
        <a
          href="/app/index.html"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Entrar ahora
        </a>
      </div>
    </main>
  );
}
