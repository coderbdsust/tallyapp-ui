import { NgModule } from '@angular/core';
import { TransactionComponent } from './transaction.component';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { RouterModule, Routes } from '@angular/router';

// transaction-routing.module.ts
const routes: Routes = [
  {
    path: '',
    component: TransactionComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {}