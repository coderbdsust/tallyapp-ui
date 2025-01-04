import { Component, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { ResponsiveHelperComponent } from './shared/components/responsive-helper/responsive-helper.component';
import { NgxSonnerToaster } from 'ngx-sonner';
import { AuthService } from './modules/auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NgClass, RouterOutlet, ResponsiveHelperComponent, NgxSonnerToaster],
})
export class AppComponent implements OnInit {
  constructor(public themeService: ThemeService, private authService: AuthService) {}
  ngOnInit(): void {
   this.authService.autoLogin();
  }
}
