# SKILL: Clerk (Auth)

> Stack: Clerk + Next.js 14 App Router + FastAPI backend

---

## Setup frontend

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

---

## Middleware — rutas protegidas

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

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="es"><body>{children}</body></html>
    </ClerkProvider>
  );
}
```

---

## Navbar — SignedIn / SignedOut

```tsx
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <header>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm">
            Iniciar sesión
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </header>
  );
}
```

---

## Hook useUsuario (wrapper del proyecto)

```typescript
// /hooks/useUsuario.ts
import { useUser } from "@clerk/nextjs";
import { RolUsuario } from "@/types";

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
      id:          user.id,
      nombre:      user.fullName,
      email:       user.primaryEmailAddress?.emailAddress || "",
      avatar:      user.imageUrl,
      rol,
      esAdmin:     rol === "admin",
      esDiputado:  rol === "diputado",
      esCiudadano: rol === "ciudadano",
    },
  };
}
```

---

## Componente SoloParaRol

```tsx
// /components/auth/SoloParaRol.tsx
import { useUsuario } from "@/hooks/useUsuario";
import { RolUsuario } from "@/types";

export function SoloParaRol({
  roles,
  children,
  fallback = null,
  requireAuth = false,
}: {
  roles: RolUsuario[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}) {
  const { isLoaded, isSignedIn, usuario } = useUsuario();

  if (!isLoaded) return null;
  if (!isSignedIn) {
    if (requireAuth) return <span className="text-sm text-gray-400">Inicia sesión para acceder</span>;
    return <>{fallback}</>;
  }
  if (!usuario || !roles.includes(usuario.rol)) return <>{fallback}</>;
  return <>{children}</>;
}
```

**Uso:**
```tsx
<SoloParaRol roles={["admin"]}>
  <button>Editar</button>
</SoloParaRol>

<SoloParaRol roles={["ciudadano", "diputado", "admin"]} requireAuth>
  <BotonSeguir proyectoId={id} />
</SoloParaRol>
```

---

## Pasar token JWT al backend (interceptor Axios)

```typescript
// /services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

export function configurarToken(getToken: () => Promise<string | null>) {
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}
```

```tsx
// /components/auth/TokenProvider.tsx
"use client";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { configurarToken } from "@/services/api";

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  useEffect(() => { configurarToken(getToken); }, [getToken]);
  return <>{children}</>;
}
```

---

## Validar JWT en FastAPI

```python
# app/core/auth.py
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from clerk_backend_api import Clerk
from app.core.config import settings

security = HTTPBearer()
clerk    = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    try:
        payload = clerk.verify_token(credentials.credentials)
        return {
            "user_id": payload["sub"],
            "rol":     payload.get("public_metadata", {}).get("rol", "ciudadano"),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

async def require_admin(user = Security(get_current_user)):
    if user["rol"] != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol admin")
    return user
```

**Uso en endpoint:**
```python
@router.post("/proyectos")
def crear(body: ProyectoCreate, db = Depends(get_db), user = Depends(require_admin)):
    ...
```

---

## Webhook — asignar rol al crear usuario

```python
# app/routers/webhooks.py
@router.post("/clerk")
async def clerk_webhook(request: Request):
    payload = await request.body()
    event   = Webhook(settings.CLERK_WEBHOOK_SECRET).verify(payload, dict(request.headers))

    if event["type"] == "user.created":
        clerk.users.update_metadata(
            user_id         = event["data"]["id"],
            public_metadata = {"rol": "ciudadano"}
        )
    return {"ok": True}
```

---

## Asignar rol admin manualmente (desde dashboard Clerk)

```
1. Clerk Dashboard → Users → seleccionar usuario
2. Metadata → Public metadata
3. Agregar: { "rol": "admin" }
4. Guardar
```

---

## Regla crítica

```
SoloParaRol  → controla lo que VE el usuario (UX, no seguridad)
require_admin → valida permisos reales en backend (seguridad real)

Un usuario con conocimientos técnicos puede ignorar la UI
y hacer requests directos a la API.
El backend DEBE validar el token y el rol en cada endpoint protegido.
```

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `401 Unauthorized` en backend | Token no se envía | Verificar `TokenProvider` montado en layout |
| Rol siempre "ciudadano" | `publicMetadata.rol` no asignado | Asignar vía webhook o dashboard Clerk |
| Redirect infinito en `/sign-in` | `NEXT_PUBLIC_CLERK_SIGN_IN_URL` incorrecto | Verificar `.env.local` |
| `useUser()` retorna `isLoaded: false` | Componente no envuelto en `ClerkProvider` | Mover `ClerkProvider` a `layout.tsx` raíz |