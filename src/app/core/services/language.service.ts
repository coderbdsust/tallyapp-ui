import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly STORAGE_KEY = 'app-language';
  private readonly DEFAULT_LANG = 'en';
  private readonly SUPPORTED_LANGS = ['en', 'bn'];

  constructor(private translate: TranslateService) {
    this.init();
  }

  private init(): void {
    this.translate.addLangs(this.SUPPORTED_LANGS);
    this.translate.setDefaultLang(this.DEFAULT_LANG);
    const savedLang = localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_LANG;
    this.translate.use(savedLang);
  }

  switchLanguage(lang: string): void {
    if (this.SUPPORTED_LANGS.includes(lang)) {
      localStorage.setItem(this.STORAGE_KEY, lang);
      this.translate.use(lang);
    }
  }

  getCurrentLang(): string {
    return this.translate.currentLang || localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_LANG;
  }

  instant(key: string, params?: object): string {
    return this.translate.instant(key, params);
  }
}
