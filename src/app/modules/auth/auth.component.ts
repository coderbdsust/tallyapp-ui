import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MenuService } from '../../core/services/menu.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    imports: [AngularSvgIconModule, RouterOutlet, TranslateModule]
})
export class AuthComponent implements OnInit {

  selectedLanguage: string = localStorage.getItem('app-language') || 'en';

  constructor(public menuService: MenuService, private languageService: LanguageService) {
    const savedLang = localStorage.getItem('app-language') || 'en';
    if (savedLang) {
      this.selectedLanguage = savedLang;
      localStorage.setItem('app-language', savedLang);
    }
  }

  ngOnInit(): void {}

  onLanguageChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value;
    if (lang && lang !== '-1') {
      this.selectedLanguage = lang;
      this.languageService.switchLanguage(lang);
    }
  }
}
