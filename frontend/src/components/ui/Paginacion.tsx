"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Props {
  page: number;
  totalPages: number;
}

export function Paginacion({ page, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-8">
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ← Anterior
      </button>

      <span className="text-sm font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
        Página {page} de {totalPages}
      </span>

      <button
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Siguiente →
      </button>
    </div>
  );
}
