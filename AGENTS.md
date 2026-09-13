# Antigravity Workspace Rules & Automated Skill Usage

## 1. Automatic Skill Discovery & Application
- Before implementing features, debugging errors, refactoring code, designing APIs, or writing tests, **always search and identify relevant skills** from the installed catalog in `C:\Users\Admin\.agents\skills\`.
- **Automatic Activation**: Whenever a task matches an available skill domain (e.g., `systematic-debugging`, `debugging-strategies`, `backend-dev-guidelines`, `typescript-expert`, `api-design-principles`, `tailwind-patterns`, `ui-ux-pro-max`, etc.), proactively read that skill's `SKILL.md` and adhere strictly to its workflows and best practices.
- **Workflow Integrity**: Follow the multi-step checklists, diagnostic steps, or design patterns dictated by the matched skill before writing code.
- **Transparency**: Briefly notify the user which skill has been activated to address their request.

## 2. Project Architecture & Standards
- **Monorepo Structure**:
  - `backend/`: NestJS, TypeORM, PostgreSQL, Helmet, Swagger, CommonJS for serverless API entrypoint.
  - `frontend/`: React 18 / Next.js-ready, Vite, TypeScript, TailwindCSS (Traditional Vanilla JS preserved on branch `traditional-vanilla` and tag `v1.0.0-traditional`).
  - `shared/`: Common types, enums, DTO interfaces.
- **Code Quality**: Ensure all code passes `tsc --noEmit` and `oxlint` with 0 errors and 0 warnings.
