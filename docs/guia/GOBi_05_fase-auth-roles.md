# GOBi — Fase 5: Autenticación y Roles

> **Objetivo:** Login real, sesión, rutas protegidas y permisos por rol en frontend y backend.

> **Prerequisito:** Fase 4 completada — sistema de diseño consistente.

---

## Contexto para tu editor de IA

```
Proyecto: GOBi — plataforma de inteligencia política costarricense
Stack: Next.js + TypeScript + Clerk + FastAPI
Fase: 5 — auth, roles, rutas protegidas
Roles: ciudadano | diputado | admin
Regla crítica: ocultar un botón NO es seguridad. El control real de acceso va en el backend.
```

---

## Setup Clerk

```bash
npm install @clerk/nextjs
```

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

Las páginas `/sign-in` y `/sign-up` las genera Clerk automáticamente. Solo necesitas crear los archivos:

```tsx
// /app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";
export default function SignInPage() {
  return <div className="flex justify-center py-20"><SignIn /></div>;
}
```

```tsx
// /app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";
export default function SignUpPage() {
  return <div className="flex justify-center py-20"><SignUp /></div>;
}
```

**JWT template en Clerk Dashboard:**
Para que el rol esté disponible en el JWT que valida FastAPI:
1. Clerk Dashboard → JWT Templates → New template
2. Nombre: `default`
3. Agregar claim: `"rol": "{{user.public_metadata.rol}}"`
4. Guardar

---

## Middleware (rutas protegidas)

```typescript
// middleware.ts (raíz del proyecto)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/perfil(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

---

## Layout con ClerkProvider

```tsx
// /app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body>
          <Providers>
            <Navbar />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## Navbar con auth

```tsx
// /components/layout/Navbar.tsx
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-blue-700 tracking-tight">GOBi</Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/proyectos", label: "Proyectos" },
            { href: "/diputados", label: "Diputados" },
            { href: "/comisiones", label: "Comisiones" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="px-3 py-2 text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                Iniciar sesión
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
```

---

## Hook de usuario con rol

```typescript
// /hooks/useUsuario.ts
import { useUser } from "@clerk/nextjs";
import { RolUsuario } from "@/types";

export interface UsuarioActual {
  id: string;
  nombre: string | null;
  email: string;
  avatar: string;
  rol: RolUsuario;
  esAdmin: boolean;
  esDiputado: boolean;
  esCiudadano: boolean;
}

export function useUsuario() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded || !isSignedIn || !user) {
    return { isLoaded, isSignedIn: false, usuario: null };
  }

  const rol = (user.publicMetadata?.rol as RolUsuario) || "ciudadano";

  return {
    isLoaded,
    isSignedIn: true,
    usuario: {
      id: user.id,
      nombre: user.fullName,
      email: user.primaryEmailAddress?.emailAddress || "",
      avatar: user.imageUrl,
      rol,
      esAdmin: rol === "admin",
      esDiputado: rol === "diputado",
      esCiudadano: rol === "ciudadano",
    } satisfies UsuarioActual,
  };
}
```

---

## Componente de acceso por rol

```tsx
// /components/auth/SoloParaRol.tsx
import { useUsuario } from "@/hooks/useUsuario";
import { RolUsuario } from "@/types";

interface Props {
  roles: RolUsuario[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean; // si true, muestra botón de login en lugar de nada
}

export function SoloParaRol({ roles, children, fallback = null, requireAuth = false }: Props) {
  const { isLoaded, isSignedIn, usuario } = useUsuario();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    if (requireAuth) return (
      <div className="text-sm text-gray-400 italic">
        Inicia sesión para acceder a esta función
      </div>
    );
    return <>{fallback}</>;
  }

  if (!usuario || !roles.includes(usuario.rol)) return <>{fallback}</>;

  return <>{children}</>;
}
```

**Uso en cualquier componente:**

```tsx
// Solo admins ven el botón de editar
<SoloParaRol roles={["admin"]}>
  <button onClick={handleEditar}>Editar proyecto</button>
</SoloParaRol>

// Diputados y admins ven su panel
<SoloParaRol roles={["diputado", "admin"]}>
  <Link href="/dashboard">Mi panel</Link>
</SoloParaRol>

// Muestra mensaje si no está autenticado
<SoloParaRol roles={["ciudadano", "diputado", "admin"]} requireAuth>
  <BotonSeguir proyectoId={id} />
</SoloParaRol>
```

---

## Interceptor Axios con token Clerk

La función `configurarToken` ya está definida en `/services/api.ts` desde la Fase 3. En esta fase solo hay que llamarla desde `TokenProvider`:

```typescript
// /services/api.ts — ya existe desde Fase 3, no modificar
// export function configurarToken(getToken: () => Promise<string | null>) { ... }
```

```tsx
// /components/auth/TokenProvider.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { configurarToken } from "@/services/api";

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    configurarToken(getToken);
  }, [getToken]);

  return <>{children}</>;
}
```

```tsx
// Agregar TokenProvider en /app/providers.tsx dentro de ClerkProvider
<TokenProvider>
  {children}
</TokenProvider>
```

---

## Onboarding de intereses

```tsx
// /app/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { temasMock } from "@/data/mock/temas";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);

  const toggle = (slug: string) => {
    setSeleccionados((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const guardar = async () => {
    setGuardando(true);
    // Guardar intereses en el backend (consultable por la API)
    // No usar unsafeMetadata de Clerk — no es accesible desde el backend de FastAPI
    await api.post("/usuarios/intereses", { slugs: seleccionados });
    router.push("/");
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">¿Qué temas te importan?</h1>
      <p className="text-gray-500 mb-8">Personaliza tu feed según tus intereses</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {temasMock.map((tema) => {
          const activo = seleccionados.includes(tema.slug);
          return (
            <button
              key={tema.id}
              onClick={() => toggle(tema.slug)}
              className={`p-4 rounded-xl border-2 transition text-left ${
                activo
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-medium text-gray-900">{tema.nombre}</p>
            </button>
          );
        })}
      </div>

      <button
        onClick={guardar}
        disabled={guardando || seleccionados.length === 0}
        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50 hover:bg-blue-700 transition"
      >
        {guardando ? "Guardando..." : "Continuar"}
      </button>
    </div>
  );
}
```

---

## Asignar rol desde el backend (solo una vez, al crear usuario)

```python
# backend: webhook de Clerk para cuando se crea un usuario
# app/routers/webhooks.py

from fastapi import APIRouter, Request, HTTPException
from clerk_backend_api import Webhook

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/clerk")
async def clerk_webhook(request: Request):
    payload = await request.body()
    headers = dict(request.headers)

    try:
        event = Webhook(settings.CLERK_WEBHOOK_SECRET).verify(payload, headers)
    except Exception:
        raise HTTPException(status_code=400, detail="Firma inválida")

    if event["type"] == "user.created":
        user_id = event["data"]["id"]
        # Asignar rol por defecto
        clerk.users.update_metadata(
            user_id=user_id,
            public_metadata={"rol": "ciudadano"}
        )

    return {"ok": True}
```

---

## Diferencia crítica: autenticación vs autorización

```
AUTENTICACIÓN = "¿Eres quien dices ser?"
  → Clerk maneja esto con JWT

AUTORIZACIÓN = "¿Tienes permiso para hacer esto?"
  → Frontend: SoloParaRol oculta/muestra UI
  → Backend: require_admin valida el JWT y el rol

IMPORTANTE:
SoloParaRol en el frontend es UX, no seguridad.
Un usuario técnico puede hacer requests directos a la API ignorando la UI.
El backend DEBE validar permisos en cada endpoint que modifica datos.
```

---

## Entregable de Fase 5

- [ ] Clerk instalado y configurado
- [ ] Middleware protegiendo `/admin/*`, `/perfil/*`, `/onboarding/*`
- [ ] Navbar con SignedIn/SignedOut/UserButton
- [ ] Hook `useUsuario()` con `rol`, `esAdmin`, `esDiputado`
- [ ] Componente `SoloParaRol` usado en toda la app
- [ ] Interceptor Axios con token JWT automático
- [ ] Onboarding de intereses al registrarse
- [ ] Perfil ciudadano en `/perfil`
- [ ] Backend: webhook de Clerk asigna rol `ciudadano` al crear usuario
- [ ] Backend: `require_admin` validando JWT en todos los endpoints de escritura

---

## Prompts para tu editor de IA

```
Proyecto: GOBi — plataforma cívica costarricense
Stack: Next.js, TypeScript, Tailwind, Clerk, FastAPI
Fase: 5 — autenticación y roles

Auth: Clerk
Hook disponible: useUsuario() → { isSignedIn, usuario: { id, rol, esAdmin, esDiputado } }
Componente disponible: SoloParaRol con prop roles: RolUsuario[]
API interceptor: ya configurado — agrega JWT automáticamente si el usuario tiene sesión

Roles: ciudadano | diputado | admin
Regla: SoloParaRol controla la UI. El backend valida permisos reales.

Tarea: [describe lo que construyes]
```

Siguiente: GOBi_06_fase-admin.md
