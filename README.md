# ScholarPress: Academic & Research Publishing Platform

ScholarPress is a high-contrast, minimalist open-access publishing platform engineered for a single independent researcher, computer scientist, or academic author. Built on a $0-budget stack with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Supabase (PostgreSQL, Auth, Storage via `@supabase/ssr`)**, and **Tiptap Headless Editor** (storing clean AST JSON).

---

## 🏛️ Architectural Overview

```
                          ┌───────────────────────────┐
                          │   Public Reader Client    │
                          └─────────────┬─────────────┘
                                        │
           GET /               GET /article/[slug]           GET /search
     (Homepage Feed)          (Manuscript + AST)          (Taxonomy Filter)
           │                            │                         │
           ▼                            ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Next.js 16 App Router                            │
│                                                                             │
│  • Server Components (RSC)               • Route Skeletons & Suspense       │
│  • Schema.org JSON-LD (ScholarlyArticle) • Dynamic Sitemap & Robots         │
│  • Proxy / Middleware Guard (src/proxy.ts guards /admin/*)                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                    Authenticated Admin│Public Queries
                    Server Actions     │(RLS Enforced)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Supabase Backend ($0 Stack)                        │
│                                                                             │
│  • PostgreSQL 15+ with Row Level Security (RLS)                             │
│  • Auth (Email & Password, Public Signups Disabled)                         │
│  • Storage (Bucket: 'article-covers' with 5MB validation & RLS)             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Characteristics
- **Zero Exposed Service Role Keys:** All client-side code strictly utilizes `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The `SUPABASE_SERVICE_ROLE_KEY` is isolated in server-only modules protected by Next.js `'server-only'`.
- **Pure JSON Content Storage:** Articles are stored directly as Tiptap AST JSON documents, avoiding raw unsanitized HTML in PostgreSQL and enabling flexible multi-target rendering (HTML, Markdown, ePub, LaTeX).
- **Hardened PostgreSQL RLS:** Public readers can only query articles where `status = 'published'` and `published_at <= NOW()`. Admin authors enjoy full CRUD privileges verified via Supabase Auth session tokens.
- **Academic Typography & Design:** High-contrast editorial palette, system serif and monospace font stacks, generous margins, responsive Table of Contents scroll spy, copyable APA/BibTeX citations, and zero tracking scripts.

---

## 🚀 Tech Stack & Dependencies

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.4.2` | Server Components, Server Actions, Dynamic Metadata |
| **Runtime** | React / React DOM | `19.3.0` | Server & Client Components, React Suspense |
| **Language** | TypeScript | `^5.0` | Strict type-safety across database & UI |
| **Styling** | Tailwind CSS / PostCSS | `v4` | High-contrast academic styling, CSS variables |
| **Database & Auth** | Supabase (`@supabase/ssr`) | `^0.12.7` | PostgreSQL 15, Auth cookies, Storage |
| **Editor** | Tiptap | `^3.32` | Headless rich-text editor (JSON AST output) |
| **Icons** | Lucide React | `^1.61` | Editorial icons with `aria-hidden` tags |

---

## 🛠️ Quickstart & Local Development

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm`, `pnpm`, or `bun`
- **Supabase Account**: A free Supabase project at [supabase.com](https://supabase.com)

### 2. Environment Configuration
Clone the repository and create your local environment file:

```bash
cp .env.example .env.local
```

Populate `.env.local` with your Supabase credentials:

```bash
# Supabase Configuration (from Supabase Dashboard -> Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Supabase Private Service Role Key (SERVER-SIDE ONLY - NEVER EXPOSE TO CLIENT)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Canonical Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Migration & Initialization
1. In your **Supabase Dashboard**, navigate to the **SQL Editor**.
2. Open [`supabase/init.sql`](./supabase/init.sql) from this repository and run the entire script.
3. The migration automatically:
   - Creates `profiles`, `articles`, `categories`, `tags`, `article_categories`, and `article_tags` tables.
   - Configures `article-covers` storage bucket with strict 5MB upload limits and image MIME filters.
   - Enforces PostgreSQL Row Level Security (RLS) on all tables and storage objects.
   - Creates automated `updated_at` triggers and user onboarding triggers.
   - Seeds initial academic disciplines and research tags.

### 4. Create Author Account & Disable Public Registration
1. In your **Supabase Dashboard**, navigate to **Authentication** -> **Users**.
2. Click **Add User** -> **Create User**.
3. Enter your author email address and a strong password (check "Auto-confirm user").
4. Navigate to **Authentication** -> **Providers** -> **Email**.
5. **CRITICAL SECURITY STEP:** Turn **OFF** the toggle for **"Allow new users to sign up"**. This guarantees that no unauthorized third party can register an author account.

### 5. Install Dependencies & Launch
```bash
# Install packages
npm install

# Run development server
npm run dev

# Run production build & verify strict TypeScript compilation
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the public journal. Open [http://localhost:3000/login](http://localhost:3000/login) to sign in to the Author Workspace.

---

## 📖 Single-Author Editorial Runbook

### Accessing the Author Portal
Navigate to `/login` and enter your Supabase email and password. Upon successful verification, Next.js sets secure HTTP-only cookies and redirects to `/admin`.

### Creating a New Manuscript (`/admin/articles/new`)
1. **Title & Abstract:** Enter your paper title. The editor automatically generates a URL-friendly slug (e.g., `Decentralized Byzantine Consensus` → `decentralized-byzantine-consensus`). You can click the custom override checkbox to customize the slug if needed.
2. **Cover Image Banner:** Upload a high-resolution cover diagram (JPEG, PNG, WebP up to 5MB). The image is automatically validated, uploaded to Supabase Storage, and stored with an absolute public CDN URL.
3. **Disciplines & Tags:** Select one primary academic category and multiple research tags.
4. **Rich-Text Composition:**
   - **Headings (H2 / H3):** Use for section and subsection dividers. The frontend reading view automatically extracts these to generate the interactive Table of Contents.
   - **Academic Footnotes / Citations:** Select any number or text and use the superscript button `[#]` to format citations.
   - **Figures & Diagrams:** Click the figure image button in the editor toolbar to upload in-body research plots with captions.
   - **Code Blocks & Quotes:** Standard fenced blocks and blockquotes for empirical code and literature citations.
5. **Publication States:**
   - **Save as Draft:** Stores the manuscript privately. Authors can preview the article at `/article/[slug]` with an amber preview banner; the public receives a 404.
   - **Publish Immediately:** Makes the paper live on the homepage feed, category indices, sitemap, and search interface.
   - **Archive:** Preserves the paper in the database while hiding it from the public feed.

### Media & Storage Management (`/admin/media`)
- View all uploaded figure plots and cover banners.
- Copy public CDN URLs with one click for external linking.
- Delete outdated or unused media directly from the bucket.

### Taxonomies (`/admin/taxonomies`)
- Inspect all registered academic categories and research tags.
- Monitor publication counts across each discipline.

---

## 🔍 SEO, Academic Indexing & Accessibility

ScholarPress is engineered from the ground up for high academic discoverability:

- **Google Scholar Ready (`ScholarlyArticle` JSON-LD):** Every article view automatically embeds `<script type="application/ld+json">` with Schema.org `ScholarlyArticle` structured data including title, author details, publication timestamp, DOI-ready canonical slug, open-access Creative Commons license (CC BY 4.0), and topic tags.
- **Google Sitelinks Search Box (`WebSite` JSON-LD):** The homepage includes `WebSite` structured data with `SearchAction` targeting `/search?q={search_term_string}`.
- **Dynamic XML Sitemap (`/sitemap.xml`):** Generated automatically via Next.js 16 metadata routes. Queries live published articles, categories, and tags with proper `lastModified`, `changeFrequency`, and `priority` attributes.
- **Automated Crawler Directives (`/robots.txt`):** Allows public crawlers full access to papers while blocking `/admin/`, `/login`, and `/api/`.
- **Open Graph & Twitter Cards:** Dynamic `generateMetadata` injects proper 1200x630 social preview cards, article publication dates, and author attribution.
- **Accessibility (WCAG Compliant):** High-contrast color palette, semantic landmark tags (`<main>`, `<article>`, `<aside>`, `<nav>`, `<header>`, `<footer>`), temporal tags (`<time dateTime="...">`), screen reader `aria-label` tags, and mobile-friendly tap targets.

---

## 💾 Database Backup & Disaster Recovery Runbook

Because ScholarPress operates on Supabase's free tier, maintaining automated or periodic point-in-time database backups is essential for data safety.

### 1. Manual SQL Snapshot via `pg_dump`
You can create an instant, complete SQL backup of your database schemas, tables, and manuscript content using standard PostgreSQL tools:

```bash
# Retrieve your Database Connection String from:
# Supabase Dashboard -> Project Settings -> Database -> Connection String (URI)

# Export complete database schema and all table data
pg_dump \
  --clean \
  --if-exists \
  --quote-all-identifiers \
  --no-owner \
  --no-privileges \
  "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  > scholarpress_backup_$(date +%Y%m%d).sql
```

### 2. Exporting Data via Supabase CLI
If you have the Supabase CLI installed locally:

```bash
# Link to your Supabase project
supabase link --project-ref your-project-id

# Dump schema only
supabase db dump -f supabase/schema.sql

# Dump full data (including articles, taxonomies, profiles)
supabase db dump --data-only -f supabase/data_backup_$(date +%Y%m%d).sql
```

### 3. Restoring from Backup
To restore a snapshot to a new or existing Supabase instance:

```bash
# Restore full SQL snapshot
psql \
  "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  < scholarpress_backup_YYYYMMDD.sql
```

### 4. Backing Up Storage Assets (`article-covers`)
All cover images and in-text figure diagrams reside in the `article-covers` bucket. You can download all bucket files via the Supabase Dashboard (`Storage` -> `article-covers` -> select all -> download) or via the Supabase Management API script.

---

## 🔒 Security Architecture Summary

1. **Proxy Protection (`src/proxy.ts`):** Next.js 16 Proxy intercepts all inbound requests to `/admin/*`. Unauthenticated users are redirected to `/login` with an appended `redirectTo` parameter.
2. **PostgreSQL RLS Policies:** Even if client-side code were modified, PostgreSQL policies reject unauthorized SELECT, INSERT, UPDATE, or DELETE queries from non-authenticated users.
3. **HTTP-Only Cookies:** Auth session tokens are managed via `@supabase/ssr` cookies with `httpOnly`, `sameSite: 'lax'`, and `secure` flags enabled.
4. **Content Security:** Tiptap AST JSON storage eliminates stored cross-site scripting (XSS) vectors.

---

## 🚢 Production Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. In **Project Settings** -> **Environment Variables**, define:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (set to your custom domain, e.g. `https://scholarpress.org`)
4. Deploy! Next.js will build all static pages and prepare dynamic Server Components automatically.

---

## 📄 License
This publishing platform is open source under the MIT License. Manuscripts authored on the platform are published under **Creative Commons Attribution 4.0 International (CC BY 4.0)**.
