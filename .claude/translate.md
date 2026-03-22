Plan to implement │
│ │
│ Localization Plan: Full App Bengali + English (ngx-translate) │
│ │
│ Context │
│ │
│ The app currently has a language selector (auth page + profile menu) that saves app-language to localStorage and sends Accept-Language header to │
│ the backend. But all frontend UI text is hardcoded in English. This plan adds full client-side localization using ngx-translate so all UI labels, │
│ menus, buttons, toast messages, and placeholders switch reactively between English and Bengali. │
│ │
│ --- │
│ Phase 1: Infrastructure Setup │
│ │
│ 1.1 Install packages │
│ │
│ npm install @ngx-translate/core @ngx-translate/http-loader │
│ │
│ 1.2 Create src/app/core/services/language.service.ts (NEW) │
│ │
│ - Wraps TranslateService from ngx-translate │
│ - Reads/writes localStorage('app-language') │
│ - Methods: switchLanguage(lang), getCurrentLang(), instant(key, params?) │
│ - providedIn: 'root' │
│ │
│ 1.3 Configure src/main.ts │
│ │
│ - Add TranslateModule.forRoot() with TranslateHttpLoader inside existing importProvidersFrom() │
│ - Loader loads from ./assets/i18n/{lang}.json │
│ - Add MissingTranslationHandler for dev-time console warnings │
│ │
│ 1.4 Initialize in src/app/app.component.ts │
│ │
│ - Inject LanguageService in constructor (triggers init) │
│ │
│ 1.5 Create translation JSON files │
│ │
│ - src/assets/i18n/en.json — English (full) │
│ - src/assets/i18n/bn.json — Bengali (full, same key structure) │
│ │
│ Keys organized as nested objects by module: │
│ COMMON._ — shared: Show, per page, Search, Cancel, Save, pagination, etc. │
│ MENU._ — sidebar: Dashboard, Employee, Product, Invoice, etc. │
│ PROFILE_MENU._ — My Profile, Change Password, Log out, Color, Language │
│ AUTH._ — Sign In, Login with SSO, tagline │
│ ERROR._ — 404/403/500/access-denied messages │
│ INVOICE._ — list/detail/add labels + toast messages │
│ EMPLOYEE._ — list/drawer labels + toasts │
│ PRODUCT._ — list/modal labels + toasts │
│ SUPPLIER._ — list/drawer/PO labels + toasts │
│ QUOTATION._ — list/add/detail labels + toasts │
│ CASH._ — cash-in/out/expense/txn labels + toasts │
│ ORGANIZATION._ — list/drawer labels + toasts │
│ USER._ — profile/change-password labels + toasts │
│ ADMIN._ — user management labels + toasts │
│ REPORT._ — report labels │
│ DASHBOARD._ — dashboard labels │
│ │
│ --- │
│ Phase 2: Core Infrastructure Changes │
│ │
│ 2.1 Update src/app/core/services/common.service.ts │
│ │
│ - Add protected translate = inject(TranslateService) (avoids breaking 21 child service constructors) │
│ - Translate toast titles: 'Error' → this.translate.instant('TOAST.ERROR'), 'Close' → this.translate.instant('TOAST.CLOSE'), etc. │
│ - Add helper methods: showToastSuccessKey(key, params?), showToastErrorKey(key), showToastInfoKey(key) — these call translate.instant() then │
│ delegate to existing toast methods │
│ │
│ 2.2 Update src/app/core/constants/menu.ts │
│ │
│ - Replace all label: values with translation keys: 'Dashboard' → 'MENU.DASHBOARD', etc. │
│ - Replace all group: values: 'Base' → 'MENU.BASE', etc. │
│ - The translate pipe in sidebar templates will resolve these keys reactively │
│ │
│ 2.3 Update language selectors to use LanguageService │
│ │
│ src/app/modules/auth/auth.component.ts: │
│ - Inject LanguageService, call switchLanguage() in onLanguageChange() │
│ - Add TranslateModule to imports │
│ │
│ src/app/modules/layout/common-components/navbar/profile-menu/profile-menu.component.ts: │
│ - Inject LanguageService, call switchLanguage() in onLanguageChange() │
│ - Change profileMenuUser titles to translation keys: 'PROFILE_MENU.MY_PROFILE', etc. │
│ - Change logoutItem.title to 'PROFILE_MENU.LOG_OUT' │
│ - Add TranslateModule to imports, use | translate pipe on menu titles in template │
│ │
│ No changes to LanguageInterceptor — it already reads from the same localStorage key. │
│ │
│ --- │
│ Phase 3: Template Conversion (All Modules) │
│ │
│ Pattern for every standalone component: │
│ 1. Add import { TranslateModule } from '@ngx-translate/core' and add to imports array │
│ 2. Replace hardcoded strings with {{ 'KEY' | translate }} │
│ 3. For attributes: [placeholder]="'KEY' | translate", [title]="'KEY' | translate" │
│ 4. For parameterized text: {{ 'KEY' | translate: { param: value } }} │
│ │
│ Batch 1 — Layout (~8 files) │
│ │
│ - sidebar-menu.component.ts/html — {{ menu.group | translate }}, {{ item.label | translate }} │
│ - sidebar-submenu.component.ts/html — {{ sub.label | translate }} │
│ - profile-menu.component.ts/html — "Color", "Language", menu titles │
│ - navbar.component.ts/html — sr-only text │
│ - bottom-navbar.component.ts/html — "Home" labels │
│ - navbar-mobile\*.component.ts/html — menu labels │
│ │
│ Batch 2 — Auth (~2 files) │
│ │
│ - auth.component.html — "Select Language", tagline │
│ - sign-in.component.html — "Sign In", "Login with SSO" │
│ │
│ Batch 3 — Error pages (~4 files) │
│ │
│ - error404.component.ts/html — "Oops!", message, "Homepage" │
│ - error403.component.ts/html │
│ - error500.component.ts/html │
│ - access-denied.component.ts/html │
│ │
│ Batch 4 — Common components (~3 files) │
│ │
│ - confirmation-modal.component.ts/html — "Cancel", "Yes" │
│ - reason-modal.component.ts/html — "Reason", placeholder, buttons │
│ - file-uploader.component.ts/html — upload labels │
│ │
│ Batch 5 — Invoice module (~4 files + TS toast messages) │
│ │
│ - invoice-list.component — title, table headers, pagination, search, empty state, button titles │
│ - add-invoice.component — form labels, section headers, button labels │
│ - invoice-detail.component — labels, button text │
│ - customer-list.component — title, table headers │
│ - TS files: convert showToastSuccess('Invoice deleted') → showToastSuccessKey('INVOICE.TOAST.DELETED') │
│ │
│ Batch 6 — Employee module (~6 files) │
│ │
│ - employee-list.component — title, headers, empty state │
│ - add-employee.component — drawer form labels │
│ - employee-expense-list, employee-expense, employee-daily-reporting, employee-income │
│ │
│ Batch 7 — Product module (~4 files) │
│ │
│ - product-list.component, add-product.component, product-category-list, product-category-form │
│ │
│ Batch 8 — Supplier module (~5 files) │
│ │
│ - supplier-list, add-supplier, purchase-order-list, purchase-order-create, purchase-order-detail │
│ │
│ Batch 9 — Quotation module (~3 files) │
│ │
│ - quotation-list, quotation-add, quotation-detail │
│ │
│ Batch 10 — Cash Management (~10 files) │
│ │
│ - cash-in, cashin-type-drawer, cash-out, cashout-type-drawer, expense │
│ - transaction-view, transaction-recent-view, cash-txn-view │
│ - journal-viewer (+ grid/tree views), cash-flow, report, account-balance-viewer, cash-balance-viewer │
│ │
│ Batch 11 — Organization module (~4 files) │
│ │
│ - organization-list, add-organization, assign-organization, organization-owner │
│ │
│ Batch 12 — User module (~4 files) │
│ │
│ - profile.component (edit), profile-view, change-password, authenticator-qr-modal │
│ │
│ Batch 13 — Admin module (~2 files) │
│ │
│ - registered-user, add-user │
│ │
│ Batch 14 — Dashboard + Report (~5 files) │
│ │
│ - Dashboard cards/components, financial-report │
│ │
│ Estimated total: ~65 components across TS + HTML files │
│ │
│ --- │
│ Phase 4: Toast Message Conversion │
│ │
│ ~55 unique hardcoded toast strings across component TS files. Two categories: │
│ │
│ Convert: Literal strings like showToastSuccess('Invoice deleted successfully') → showToastSuccessKey('INVOICE.TOAST.DELETED') │
│ │
│ Leave as-is: showToastErrorResponse(err) and showToastSuccess(response.message) — these use server-returned messages already localized via │
│ Accept-Language header. │
│ │
│ --- │
│ Verification │
│ │
│ 1. ng build — ensure no compilation errors │
│ 2. Runtime: switch languages via profile menu, verify: │
│ - Sidebar menu labels change reactively (no reload) │
│ - All page labels, buttons, placeholders update │
│ - Toast messages appear in selected language │
│ - Language persists after page refresh (localStorage) │
│ 3. Check browser Network tab: Accept-Language header matches selected language │
│ 4. Check console for Missing translation: warnings (from MissingTranslationHandler) │
│ 5. Verify both JSON files have identical key structures
