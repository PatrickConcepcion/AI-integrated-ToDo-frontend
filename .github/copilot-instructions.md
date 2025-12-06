# AI Integrated Todo — Frontend (Vue 3)

## Code Principles

Follow **DRY** (Don't Repeat Yourself) and **SOLID** principles:

- **Single Responsibility**: Each store, composable, and component should have one clear purpose.
- **Open/Closed**: Extend via composables and props rather than modifying existing code.
- **Liskov Substitution**: Components accepting props should work with any valid prop type.
- **Interface Segregation**: Keep TypeScript interfaces focused; split large interfaces into smaller ones.
- **Dependency Inversion**: Inject dependencies (stores, composables) rather than importing directly in deeply nested code.

**DRY in practice**:
- Extract repeated logic into composables (`src/composables/`).
- Reuse Zod schemas instead of duplicating validation rules.
- Share UI patterns via components (`ConfirmationModal`, `TaskCard`).

## Architecture Overview

Vue 3 + Vite + TypeScript SPA with Pinia stores, Vue Router, and Tailwind CSS.

| Layer | Purpose | Key Files |
|-------|---------|-----------|
| **Views** | Page-level components (route targets) | `src/views/*.vue` |
| **Components** | Reusable UI (modals, cards, admin tables) | `src/components/**/*.vue` |
| **Stores** | Global state via Pinia composition API | `src/stores/{auth,tasks,ai}.ts` |
| **Composables** | Shared logic (toasts, API error handling) | `src/composables/use*.ts` |
| **Validators** | Zod schemas for form validation | `src/validators/{auth,task}.ts` |
| **Types** | TypeScript interfaces | `src/types/*.ts` |
| **API** | Axios instance with interceptors | `src/api/axios.ts` |

## Developer Commands

```bash
npm run dev      # Start dev server (Vite)
npm run build    # Production build
npm run test     # Run Vitest tests
npm run preview  # Preview production build
```

## Key Conventions

### State Management (Pinia)
- Use **composition API** style (`defineStore('name', () => { ... })`).
- Expose `loading` and `error` refs for async operations.
- Example pattern in `src/stores/tasks.ts`.

### Form Validation
- Define Zod schemas in `src/validators/` and integrate via `@vee-validate/zod`.
- Use `useApiError().transformValidationErrors()` to map backend errors to VeeValidate.

### Error & Toast Handling
- Always use `useApiError().handleApiError(err, errorRef, fallbackMessage)` in store catch blocks.
- Toasts via `useToast().success()` / `useToast().toastError()` (wraps vue3-toastify).

### Confirmation Modals
- Replace native `confirm()` with `<ConfirmationModal>` (see `src/components/modals/ConfirmationModal.vue`).
- Manage modal state via local `reactive({ open, message, ... })` or `useConfirmationModal` composable.

### API Communication
- Use the pre-configured axios instance from `src/api/axios.ts` (auto-attaches Bearer token, handles refresh).
- Backend base URL set via `VITE_API_URL` env var.

### Routing & Guards
- Routes in `src/router/index.ts`; use `meta: { requiresAuth, requiresAdmin, guest }`.
- Navigation guards enforce auth/admin access.

## Testing Patterns

- Tests live in `src/tests/*.spec.ts`.
- Mock axios and composables; see `src/tests/tasks.spec.ts` for store testing example.
- Setup file `src/tests/setup.ts` stubs `localStorage`.

## File Naming

| Type | Convention |
|------|------------|
| Views | `PascalCase.vue` matching route name |
| Components | `PascalCase.vue` |
| Stores/Composables | `camelCase.ts` (e.g., `useToast.ts`) |
| Validators | `camelCase.ts` exporting Zod schemas |
