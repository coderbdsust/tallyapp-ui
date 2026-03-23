# TallyApp UI — ngx-translate Localization Guide

## Overview
The app uses `@ngx-translate/core` + `@ngx-translate/http-loader` for runtime i18n.
Translation JSON files are loaded on-demand from `src/assets/i18n/{lang}.json`.

Supported languages: **English (`en`)**, **Bengali (`bn`)**

---

## Architecture

### 1. Bootstrap Configuration (`src/main.ts`)
```
TranslateModule.forRoot({
  defaultLanguage: 'en',
  loader: { provide: TranslateLoader, useClass: TranslateHttpLoader },
  missingTranslationHandler: { provide: MissingTranslationHandler, useClass: AppMissingTranslationHandler }
})
```
- `TranslateHttpLoader` fetches `./assets/i18n/{lang}.json` (configured via `TRANSLATE_HTTP_LOADER_CONFIG`)
- `AppMissingTranslationHandler` logs missing keys to console and returns the raw key as fallback
- `LanguageInterceptor` is registered to attach language headers to HTTP requests

### 2. LanguageService (`src/app/core/services/language.service.ts`)
Singleton service (`providedIn: 'root'`) that wraps `TranslateService`:
- **`init()`** — called in constructor; reads saved language from `localStorage('app-language')`, defaults to `'en'`
- **`switchLanguage(lang)`** — saves to localStorage + calls `translate.use(lang)` (triggers re-render)
- **`getCurrentLang()`** — returns active language code
- **`instant(key, params?)`** — synchronous translation lookup
- **`SUPPORTED_LANGS`** — `['en', 'bn']` (add new languages here)

### 3. AppComponent (`src/app/app.component.ts`)
Injects `LanguageService` in constructor to trigger `init()` at app startup. No template usage.

### 4. Language Switcher UI (`profile-menu.component.ts`)
- Located in navbar profile dropdown
- Uses `<select>` bound to `selectedLanguage` (initialized from localStorage)
- Calls `languageService.switchLanguage(lang)` on change
- Also available on the auth/sign-in page (`auth.component.ts`)

---

## How to Use in Components

### HTML Templates — `| translate` pipe
Add `TranslateModule` to the component's `imports` array, then use:

```html
<!-- Simple text -->
<h1>{{ 'SECTION.KEY' | translate }}</h1>

<!-- With parameters -->
<span>{{ 'SECTION.KEY' | translate: { name: userName } }}</span>
<!-- JSON: "KEY": "Hello, {{name}}!" -->

<!-- Attribute binding -->
<input [placeholder]="'SECTION.SEARCH' | translate" />

<!-- Fallback pattern (show dynamic value OR translated default) -->
<span>{{ user?.name || ('USER.PROFILE.FULL_NAME' | translate) }}</span>

<!-- Ternary -->
<span>{{ hasPhoto ? ('USER.PROFILE.CHANGE_PHOTO' | translate) : ('USER.PROFILE.UPLOAD_PHOTO' | translate) }}</span>
```

### TS Files — Toast Messages
All services extend `CommonService` which has `protected translate = inject(TranslateService)` and provides:

```typescript
// Direct string (server-returned messages) — leave as-is
this.someService.showToastSuccess(response.message);
this.someService.showToastErrorResponse(err);

// Translation key-based (hardcoded UI messages) — use Key variants
this.someService.showToastSuccessKey('MODULE.TOAST.KEY');
this.someService.showToastErrorKey('MODULE.TOAST.KEY');
this.someService.showToastInfoKey('MODULE.TOAST.KEY');

// With interpolation parameters
this.someService.showToastInfoKey('MODULE.TOAST.KEY', { date: someDate });
```

**Rule:** Never use `showToastSuccess('hardcoded string')` — always use `showToastSuccessKey('TRANSLATION.KEY')` for any UI-originated message.

---

## JSON File Structure (`src/assets/i18n/en.json`)

```
{
  "COMMON": { ... }           — Shared UI labels (Show, Cancel, Save, Amount, etc.)
  "TOAST": { ... }            — Toast titles (Error, Success, Info, Close)
  "MENU": { ... }             — Sidebar/nav menu labels
  "PROFILE_MENU": { ... }     — Profile dropdown items
  "AUTH": { ... }              — Sign-in page
  "ERROR": { ... }            — Error pages (403, 404, 500)
  "INVOICE": { ... }          — Invoice module (includes TOAST, CUSTOMER_LIST sub-sections)
  "EMPLOYEE": { ... }         — Employee module (EXPENSE, DAILY_REPORTING, INCOME, CALENDAR, EXPENSE_DRAWER)
  "PRODUCT": { ... }          — Product module (CATEGORY_LIST, CATEGORY_FORM)
  "SUPPLIER": { ... }         — Supplier module (PO sub-section)
  "QUOTATION": { ... }        — Quotation module
  "CASH": { ... }             — Cash management (CASH_IN, CASH_OUT, EXPENSE, TRANSACTION, CASH_TXN, JOURNAL, CASH_FLOW, BALANCE)
  "ORGANIZATION": { ... }     — Admin organization management
  "USER": { ... }             — User profile (PROFILE, CHANGE_PASSWORD, TWO_FA)
  "ADMIN": { ... }            — Admin user management
  "DASHBOARD": { ... }        — Dashboard components
  "REPORT": { ... }           — Financial reports
  "ORG": { ... }              — Organization list/detail (user-facing)
  "LAYOUT": { ... }           — Layout chrome
}
```

### Key Naming Conventions
- **Dot-separated hierarchy**: `MODULE.SECTION.KEY` (e.g., `INVOICE.TOAST.DELETED`)
- **Toast keys** go under `MODULE.TOAST.*` or `MODULE.SECTION.TOAST.*`
- **Shared keys** use `COMMON.*` namespace (Show, Cancel, Amount, Entries, etc.)
- **Interpolation** uses double curly braces in JSON: `"KEY": "Hello, {{name}}!"`

---

## Adding a New Language

1. Create `src/assets/i18n/{code}.json` with same key structure
2. Add the code to `SUPPORTED_LANGS` in `language.service.ts`
3. Add `<option>` in profile-menu and auth language selectors

---

## Adding Translations to a New Component

1. Add `TranslateModule` to the component's `imports` array:
   ```typescript
   import { TranslateModule } from '@ngx-translate/core';
   @Component({ imports: [..., TranslateModule] })
   ```
2. Replace hardcoded strings in HTML with `{{ 'KEY' | translate }}`
3. Replace hardcoded toast strings in TS with `showToastSuccessKey('KEY')`
4. Add keys to **all** JSON files (`en.json`, `bn.json`)
5. Run `ng build` to verify

---

## Conversion Status (as of feature/service branch)

### Fully Converted (HTML + TS toasts)
All modules: Invoice, Employee, Product, Supplier, Cash Management, Quotation, Report, Organization, User/Profile, Admin, Dashboard, Error pages, Auth, Layout (sidebar, navbar, profile menu)

### Left As-Is
- `showToastSuccess(response.message)` — server-returned messages
- `showToastSuccess(response.message || 'fallback')` — server message with local fallback
- `showToastErrorResponse(err)` — server error responses
- Demo/template dashboard components (card-profile, card-settings, card-table, card-social-traffic) — hardcoded sample data, not real UI
