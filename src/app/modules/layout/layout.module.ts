import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { LayoutRoutingModule } from './layout-routing.module';
import { AuthService } from '../auth/services/auth.service';
@NgModule({ imports: [LayoutRoutingModule, AngularSvgIconModule.forRoot()], providers: [provideHttpClient(withInterceptorsFromDi()), AuthService] })
export class LayoutModule {}
