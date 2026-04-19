// /src/components/ui/EmptyState.tsx
interface Props {
  titulo: string;
  descripcion?: string;
  icono?: string;
}

export function EmptyState({ titulo, descripcion, icono = "📭" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">{icono}</span>
      <h3 className="font-semibold text-gray-900 mb-1">{titulo}</h3>
      {descripcion && <p className="text-sm text-gray-500 max-w-xs">{descripcion}</p>}
    </div>
  );
}
