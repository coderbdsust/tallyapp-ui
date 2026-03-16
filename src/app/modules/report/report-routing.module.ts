import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { ReportContainerComponent } from './report-container.component';
import { FinancialReportComponent } from './pages/financial-report/financial-report.component';

const routes: Routes = [
  {
    path: '',
    component: ReportContainerComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'financial', pathMatch: 'full' },
      { path: 'financial', component: FinancialReportComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule {}
