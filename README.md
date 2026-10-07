# Boilerplate PWA Multi-Rubro

Una base de código reutilizable para construir PWAs multi-rubro (restaurantes, clínicas, barberías, gimnasios, tiendas) cambiando solo configuración, no reescribiendo código.

## Stack Tecnológico

### Monorepo
- **Turborepo** - Build system y task runner
- **pnpm** - Package manager

### Frontend (apps/web)
- **Next.js 14** (App Router) - React framework con SSR/ISR
- **React 18** - UI library
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Componentes base accesibles
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **next-intl** - Internacionalización (i18n)
- **next-pwa** - PWA support

### Backend (apps/api)
- **Express** - Web framework
- **TypeScript** - Tipado estático
- **Drizzle ORM** - Type-safe ORM
- **PostgreSQL** (Supabase) - Base de datos
- **Better Auth** - Autenticación
- **Zod** - Validación de esquemas

### Packages Compartidos (packages/)
- `@boilerplate/ui` - Componentes UI compartidos
- `@boilerplate/config` - Esquemas Zod y tipos de configuración
- `@boilerplate/db` - Esquema Drizzle y conexión DB
- `@boilerplate/utils` - Utilidades compartidas
- `@boilerplate/eslint-config` - Config ESLint compartida
- `@boilerplate/tsconfig` - Config TypeScript compartida

## Arquitectura Multi-Rubro

```
apps/web/src/app/[locale]/[negocio]/
├── page.tsx          # Landing pública
├── menu/page.tsx     # Catálogo/servicios
├── reservar/page.tsx # Sistema de reservas
└── admin/            # Panel del dueño (protegido)
```

Cada negocio se configura vía JSON en `negocios.configJson`:
- Branding (colores, logo, fuente)
- Módulos activos (reservas, catálogo, carrito, etc.)
- Textos por idioma (es/en)
- Integraciones (WhatsApp, Google Maps, Calendario)
- SEO

## Instalación

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Generar migraciones DB
pnpm db:generate

# Aplicar migraciones
pnpm db:push

# Desarrollo
pnpm dev
```

## Scripts Disponibles

```bash
# Desarrollo (levanta web + api)
pnpm dev

# Build producción
pnpm build

# Linting
pnpm lint

# Type checking
pnpm typecheck

# Formatear código
pnpm format

# Base de datos
pnpm db:generate  # Generar migraciones
pnpm db:push      # Aplicar cambios a DB
pnpm db:studio    # Abrir Drizzle Studio
```

## Estructura del Proyecto

```
boilerplate-pwa/
├── apps/
│   ├── web/                 # Next.js 14 frontend
│   └── api/                 # Express backend
├── packages/
│   ├── ui/                  # Componentes UI (shadcn/ui)
│   ├── config/              # Esquemas Zod + tipos
│   ├── db/                  # Drizzle ORM schema
│   ├── utils/               # Helpers compartidos
│   ├── eslint-config/       # Config ESLint
│   └── tsconfig/            # Config TypeScript
├── turbo.json               # Turborepo config
├── package.json             # Root package.json
├── tsconfig.json            # Root tsconfig
├── .env.example             # Variables de entorno ejemplo
└── README.md                # Este archivo
```

## Configuración por Negocio

Ejemplo de `configJson` para un negocio:

```json
{
  "negocioId": "clinica-dental-sonrisa",
  "slug": "clinica-dental-sonrisa",
  "rubro": "clinica",
  "branding": {
    "nombre": "Clínica Dental Sonrisa",
    "logo": "https://res.cloudinary.com/.../logo.png",
    "colorPrimario": "#0EA5E9",
    "colorSecundario": "#F0F9FF",
    "fuente": "Inter"
  },
  "modulos": {
    "reservas": true,
    "catalogo": true,
    "carrito": false,
    "puntos": false,
    "recordatorios": true,
    "resenas": true
  },
  "textos": {
    "es": {
      "heroTitulo": "Reserva tu cita en 2 clics",
      "heroSubtitulo": "Sin llamadas, sin esperas",
      "cta": "Reservar ahora"
    },
    "en": {
      "heroTitulo": "Book your appointment in 2 clicks",
      "heroSubtitulo": "No calls, no waiting",
      "cta": "Book now"
    }
  },
  "integraciones": {
    "whatsapp": "+584241234567",
    "googleMaps": "https://maps.google.com/...",
    "calendario": "google"
  },
  "seo": {
    "title": "Clínica Dental Sonrisa - Reserva Online",
    "description": "Reserva tu cita dental online 24/7",
    "ogImage": "https://res.cloudinary.com/.../og.png"
  }
}
```

## Despliegue

### Frontend (Vercel)
```bash
vercel deploy apps/web
```

### Backend (Railway/Render)
```bash
# Configurar variables de entorno en el dashboard
# Deploy automático desde main branch
```

## Roadmap

- [x] Setup monorepo + tooling
- [x] Frontend base (Next.js + i18n + theming)
- [x] Backend base (Express + Drizzle + Auth middleware)
- [ ] Better Auth integration completa
- [ ] WhatsApp Business API integration
- [ ] PDF generation (cotizaciones, recibos)
- [ ] Stripe + MercadoPago payments
- [ ] Push notifications (Web Push)
- [ ] Admin dashboard completo
- [ ] Tests (Vitest + Playwright)
- [ ] CI/CD GitHub Actions
- [ ] Documentación completa

## Licencia

MIT