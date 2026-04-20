import { ListadoComisiones } from "@/features/comisiones/ListadoComisiones";

export const metadata = {
  title: "Comisiones - GOBi",
  description: "Directorio de comisiones legislativas",
};

export default function ComisionesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comisiones</h1>
        <p className="text-muted-foreground mt-2">
          Directorio de comisiones legislativas y sus miembros.
        </p>
      </div>

      <ListadoComisiones />
    </div>
  );
}
