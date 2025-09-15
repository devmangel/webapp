# Cómo leer estas reglas

- **Scope:** _cómo_ implementamos (no _qué_ pide el negocio).
- **Orden de precedencia si hay conflicto**: `SEC > PERF > ARCH > CODE > INT > DOC > STYLE`.
- **Suposiciones**: Next.js **>= 13.4** con **App Router**; TypeScript estricto.

---

## 1) Arquitectura & Componentes (ARCH)

- **ARCH-1 (MUST)** **Server Components por defecto**. Marca **Client** sólo cuando haya: estado UI local, efectos, listeners, o librerías que lo requieran (`'use client'` en el tope).
- **ARCH-2 (MUST)** **Data Fetching en el servidor** (RSC, Route Handlers o Server Actions). Nada de `fetch` con credenciales en cliente.
- **ARCH-3 (MUST)** **BFF interno** en `app/api/**/route.ts` para hablar con servicios externos; el cliente del navegador **nunca** llama proveedores 3rd-party directos.
- **ARCH-4 (SHOULD)** Co-loca todo por ruta: `app/(grupo)/feature/page.tsx|layout.tsx|loading.tsx|error.tsx|not-found.tsx|components/*|lib/*|schema.ts`.
- **ARCH-5 (SHOULD)** Server Actions para mutaciones (`'use server'`) + invalidación por **tags**. Evita API roundtrips extra.
- **ARCH-6 (SHOULD)** **Edge Runtime** sólo para peticiones read-only, bajas latencias y sin dependencias Node; **Node Runtime** para SDKs, DB y crypto.

---

## 2) Seguridad (SEC)

**Sesión y autenticación**

- **SEC-1 (MUST)** Sesión en **cookies HttpOnly, Secure, SameSite=Lax/Strict**; **nunca** tokens en `localStorage`.
- **SEC-2 (MUST)** Verifica **Origin/Referer** en mutaciones y usa **CSRF token** en Server Actions/Route Handlers para usuarios autenticados.
- **SEC-3 (MUST)** No exponer secretos; sólo variables con `NEXT_PUBLIC_` pueden llegar al cliente.

**Cabeceras y protección**

- **SEC-4 (MUST)** Aplica **CSP** estricta, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` (HSTS).
- **SEC-5 (MUST)** Sanitiza cualquier HTML dinámico; **prohibido** `dangerouslySetInnerHTML` salvo con sanitización (DOMPurify en server).

**Inputs y rutas**

- **SEC-6 (MUST)** Valida todo input con Zod/Yup en **server** (Route Handlers/Server Actions). El cliente puede validar **además**, nunca en lugar de.
- **SEC-7 (MUST)** `cache: 'no-store'` para rutas autenticadas; **no** cachear respuestas con datos sensibles.
- **SEC-8 (SHOULD)** Rate-limit por IP/usuario en `app/api/*/route.ts` (p.ej., token bucket + Redis).

**Ejemplo de headers en `next.config.js`**

```ts
// next.config.js
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=(), camera=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // CSP básica; si usas inline scripts, cambia a nonce/hashes
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'",
  },
];
module.exports = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};
```

---

## 3) Datos & Fetching (INT)

- **INT-1 (MUST)** Usa `fetch` nativo en server con opciones de caché explícitas:

  - Público/estático: `next: { revalidate: 60 }` o `force-cache`
  - Autenticado/privado: `cache: 'no-store'`

- **INT-2 (SHOULD)** **Revalidate Tag** en mutaciones:

```ts
// 'use server'
import { revalidateTag } from "next/cache";
export async function updatePost(input: FormData) {
  /* ... */ revalidateTag("posts");
}
```

- **INT-3 (MUST)** Manejo de errores controlado: `try/catch` en server, respuestas tipadas y componentes de error mediante `error.tsx`/`not-found.tsx`.
- **INT-4 (SHOULD)** Esquemas de IO con Zod y **transform** a tipos (`z.infer`).

---

## 4) Routing & UI (CODE)

- **CODE-1 (MUST)** Usa `layout.tsx` por segmento y **Suspense** para streaming.
- **CODE-2 (MUST)** `loading.tsx` sólo para esperas reales; evita spinners infinitos.
- **CODE-3 (SHOULD)** Navegación con `<Link prefetch>` (por defecto) y rutas **segmentadas** para code-split natural.
- **CODE-4 (MUST)** Componentes cliente **pequeños y puros**. Nada de fetch ni lógica de sesión en cliente.
- **CODE-5 (SHOULD)** Estado: **server-first**. Para UI local usa `useState`; para remoto **URL state** y **server actions**; evita stores globales salvo necesidad real.

---

## 5) Performance & Budgets (PERF)

- **PERF-1 (MUST)** **JS en cliente < 150 kB gzip por ruta** (ideal < 90 kB). Revisa `next build` y analiza chunks.
- **PERF-2 (MUST)** **Images** con `next/image`; set `sizes` y `placeholder="blur"` cuando aporte; formatos modernos (AVIF/WebP).
- **PERF-3 (SHOULD)** **Fonts** con `next/font` (local/Google) y `display: swap`.
- **PERF-4 (SHOULD)** **Dynamic import** de componentes cliente pesados:

```ts
const Chart = dynamic(() => import("./Chart"), {
  ssr: false,
  loading: () => <Skeleton />,
});
```

- **PERF-5 (MUST)** Evita CSS-in-JS en runtime; prioriza **Tailwind/CSS Modules**. CSS crítico bajo 100 kB.
- **PERF-6 (SHOULD)** **Streaming** de RSC para vistas largas; coloca **Suspense boundaries** por bloques.
- **PERF-7 (SHOULD)** Medir: LCP < **2.5s**, CLS < **0.1**, INP p75 < **200ms** (Web Vitals + Lighthouse CI).

---

## 6) Server Actions & Mutaciones (CODE)

- **CODE-6 (MUST)** Server Actions con `'use server'`, validación Zod y protección CSRF/origin cuando haya sesión.
- **CODE-7 (SHOULD)** Responder **POJOs** o `redirect()`/`revalidateTag`; no retornes entidades completas.
- **CODE-8 (SHOULD)** Usa **FormData**/progressive enhancement en formularios; fallback accesible sin JS.

---

## 7) BFF / Route Handlers (INT)

- **INT-5 (MUST)** `app/api/**/route.ts` como frontera: valida entrada, aplica **auth**, llama servicios/SDKs y devuelve JSON tipado.
- **INT-6 (MUST)** **No CORS** abierto; si necesitas compartir, **lista blanca** de orígenes.
- **INT-7 (SHOULD)** Rate-limit, logs estructurados y trazas por endpoint.
- **INT-8 (MUST)** Para respuestas cacheables, usa `export const revalidate = N` o `Response` con `Cache-Control`.

---

## 8) SEO & Accesibilidad (DOC/STYLE)

- **DOC-1 (MUST)** **Metadata API** (`export const metadata = {...}`) para title, OG, Twitter; canónica y `robots`.
- **DOC-2 (SHOULD)** `app/sitemap.ts` y `robots.ts` generados.
- **STYLE-1 (MUST)** `eslint-plugin-jsx-a11y`; textos alternativos, orden de foco, `:focus-visible`.
- **STYLE-2 (SHOULD)** JSON-LD en server (RSC) para rich snippets.

---

## 9) Versionado, entornos y config (STYLE/DOC)

- **STYLE-3 (MUST)** TypeScript `"strict": true`; prohíbe `any`/`@ts-ignore` salvo justificado.
- **STYLE-4 (MUST)** Conv. Commits + CI que falla si `lint`/`typecheck`/`test` rompen.
- **DOC-3 (MUST)** `README` con: cómo correr, variables env, flujos de datos, budgets y comandos de build/preview.
- **STYLE-5 (SHOULD)** `middleware.ts` para redirecciones, geo/AB testing y seguridad transversal.

---

## 10) Testing & Observabilidad (CODE)

- **CODE-9 (MUST)** **Playwright** e2e para rutas críticas (auth, checkout, formularios).
- **CODE-10 (SHOULD)** **Vitest/Jest** para utilidades y componentes cliente.
- **CODE-11 (SHOULD)** **Lighthouse CI** en PRs; falla si LCP/CLS/INP sobrepasan budgets.
- **CODE-12 (SHOULD)** `instrumentation.ts` para trazas/metrics (OTel/PostHog/GA4) con **scrub** de PII.

---

## 11) Payments (frontend) — UX + seguridad

- **PAY-1 (MUST)** Integra **Checkout/Portal** del proveedor (p.ej., Stripe) desde **Server Actions/BFF**; el cliente recibe **sólo** URLs de sesión.
- **PAY-2 (MUST)** **Nunca** renderices datos de tarjeta en la app; usa elementos del proveedor hospedados/PCI.
- **PAY-3 (SHOULD)** Estados de suscripción leídos desde server y cacheados con `revalidateTag('subscription')` tras webhook.

---

## 12) Webhooks (cuando residan en Next)

- **WH-1 (MUST)** `app/api/webhooks/**/route.ts` sólo verifica firma + persiste evento + **enqueue** (si tienes cola) → responde 2xx **rápido**.
- **WH-2 (MUST)** **Idempotencia** por `eventId`; `cache: 'no-store'`; sin CORS público.
- **WH-3 (SHOULD)** Registro de entrega y métricas (tasa de fallo, latencia).

---

## 13) Budgets y listas de verificación

**Budgets**

- **Cliente por ruta**: JS < **150 kB gzip** (ideal < 90 kB) | CSS < **100 kB**.
- **Imágenes**: LCP hero ≤ **120 kB** (WebP/AVIF, responsive).
- **Web Vitals**: LCP < 2.5s | CLS < 0.1 | INP < 200ms.

**Definition of Done (por ruta/feature)**

- [ ] RSC por defecto; cliente sólo si necesario.
- [ ] Entradas validadas (Zod) y manejo de errores.
- [ ] Caché/Revalidate definidos (o `no-store`).
- [ ] Metadata/SEO y accesibilidad pasadas.
- [ ] Budgets de JS/CSS/Imágenes OK.
- [ ] Tests (Playwright) de flujo crítico.
- [ ] Logs/trazas mínimas añadidas.

---

## 14) Snippets útiles

**Server Action segura con validación y revalidación**

```ts
// app/(dashboard)/posts/actions.ts
"use server";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { assertCsrf } from "@/lib/csrf";

const Schema = z.object({ title: z.string().min(2), body: z.string().min(10) });

export async function createPost(formData: FormData) {
  const origin = headers().get("origin");
  await assertCsrf(cookies(), origin); // SEC-2
  const input = Schema.parse(Object.fromEntries(formData));
  // llama a tu BFF/DB aquí (server)
  await repo.create(input);
  revalidateTag("posts"); // INT-2
}
```

**Route Handler con caché pública e invalidación**

```ts
// app/api/public/posts/route.ts
import { NextResponse } from "next/server";
export const revalidate = 120; // PERF cache

export async function GET() {
  const posts = await repo.listPublic();
  return NextResponse.json(posts, { status: 200 });
}
```

**Middleware con reglas mínimas**

```ts
// middleware.ts
import { NextResponse } from "next/server";
export function middleware(req: Request) {
  const res = NextResponse.next();
  res.headers.set("x-request-id", crypto.randomUUID());
  return res;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 15) Living Rules

- **LR-1 (MUST)** Revisar reglas cada **trimestre**; ajustar budgets y CSP según dependencias.
- **LR-2 (SHOULD)** Cuando agregues una lib cliente > **20 kB**, documenta motivo y alternativa evaluada.
- **LR-3 (MUST)** Cualquier excepción a **SEC** o **PERF** requiere ADR corto y ticket de remediación.