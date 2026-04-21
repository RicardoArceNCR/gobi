"use client";

import { formatearFecha } from "@/lib/utils";
import type { Documento } from "@/types";

interface Props {
  documentos: Documento[];
}

export function ProyectoDocumentos({ documentos }: Props) {
  if (!documentos || documentos.length === 0) return null;

  return (
    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-5">Documentos Adjuntos</h3>
      <ul className="space-y-3">
        {documentos.map((doc) => (
          <li key={doc.id}>
            <a 
              href={doc.url} 
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 p-4 bg-white border rounded-xl hover:shadow-md hover:border-blue-200 transition group"
            >
              <span className="text-2xl grayscale group-hover:grayscale-0 transition">
                {doc.tipo === "audio" ? "🎵" : doc.tipo === "video" ? "🎬" : "📄"}
              </span>
              <div>
                <span className="font-medium text-blue-600 line-clamp-1 group-hover:underline">{doc.nombre}</span>
                <span className="text-xs text-gray-500">
                  {doc.fechaSubida ? formatearFecha(doc.fechaSubida) : "Fecha no disponible"}
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
