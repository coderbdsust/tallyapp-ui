import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MenuService } from '../../core/services/menu.service';
import { MatDialogModule } from '@angular/material/dialog';
import { NgModel } from '@angular/forms';

@Component({ 
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    imports: [AngularSvgIconModule, RouterOutlet]
})
export class AuthComponent implements OnInit {
  
  selectedLanguage: string = localStorage.getItem('app-language') || 'en';

  constructor(public menuService: MenuService) {
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
      localStorage.setItem('app-language', lang);
    }
  }
}
