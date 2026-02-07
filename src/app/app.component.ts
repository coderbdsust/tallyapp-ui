import { Component } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { RouterOutlet } from '@angular/router';
import { ResponsiveHelperComponent } from './common/components/responsive-helper/responsive-helper.component';
import { NgxSonnerToaster } from 'ngx-sonner';
import { LoaderComponent } from "./modules/loader/loader.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet, ResponsiveHelperComponent, NgxSonnerToaster, LoaderComponent]
})
export class AppComponent {
  constructor(public themeService: ThemeService) {}
}
