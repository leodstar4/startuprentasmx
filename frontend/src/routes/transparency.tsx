import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transparency")({
  head: () => ({ meta: [{ title: "Renta MX" }] }),
  component: NotAvailable,
});

function NotAvailable() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-lg text-muted-foreground">🚧 Funcionalidad no disponible en la demo.</p>
    </div>
  );
}
