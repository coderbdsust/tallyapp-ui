# TallyApp UI - Project Memory

## Tech Stack
- Angular 19 with standalone components
- Tailwind CSS for styling
- keycloak-angular v19.0.2 + keycloak-js v26.2.3 for auth (SSO)
- Uses `moduleResolution: "node"` with path mapping for keycloak-js

## Key Architecture Decisions
- **Keycloak SSO**: Auth handled by Keycloak with `onLoad: 'login-required'`
- **Functional guard**: `authGuard` (CanActivateFn) replaced class-based `AuthGuard`
- **AuthService**: Thin wrapper around `inject(Keycloak)` — roles prefixed `role.`, modules prefixed `module.` in realm_access
- **Menu filtering**: Based on `authService.getModules()` matched against `requiredModules` in menu constants

## Important Patterns
- Error pages follow consistent design: `max-w-lg` card with `bg-background`, `ButtonComponent`, and image/SVG
- Services extend `CommonService` for toast/error helpers
- `keycloak-js` needs `paths` mapping in tsconfig.json because it uses `exports` field incompatible with `moduleResolution: "node"`

## Localization (ngx-translate)
- **Full guide**: see [translate-module.md](./translate-module.md)
- `@ngx-translate/core` + `@ngx-translate/http-loader` with JSON files at `src/assets/i18n/{lang}.json`
- Languages: `en`, `bn` — configured in `LanguageService.SUPPORTED_LANGS`
- Components: add `TranslateModule` to `imports`, use `{{ 'KEY' | translate }}` in HTML
- Toast messages: use `showToastSuccessKey('KEY')` / `ErrorKey` / `InfoKey` (not hardcoded strings)
- All modules fully converted (HTML + TS toasts) on `feature/service` branch

## Supplier Module (feature/supplier branch)
- Module: `SUPPLIER_MANAGEMENT` in Keycloak realm_access
- Route: `/supplier` → lazy-loaded `SupplierModule`
- Sub-routes: `/supplier/list`, `/supplier/purchase-order`, `/supplier/purchase-order/create`, `/supplier/purchase-order/detail`
- Services: `SupplierService`, `PurchaseOrderService` (both in `core/services/`)
- PO lifecycle: DRAFT → APPROVED → PARTIALLY_PAID → PAID (or CANCELLED)
- Drawer pattern (Flowbite) used for add/edit supplier, full page form for PO create/edit

## Gotchas
- When switching `moduleResolution` to `bundler`, rxjs types break (376+ errors). Keep `node` + `paths` workaround.
- Many files reference AuthService for `showToastError` — after rewrite, redirect to `CommonService` or domain service
- `profile.component.ts` used `authService.getGenderList()` — moved to `UserprofileService`
