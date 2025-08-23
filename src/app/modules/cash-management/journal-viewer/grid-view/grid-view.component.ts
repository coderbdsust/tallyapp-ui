import { CommonModule, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { N } from '@angular/core/navigation_types.d-DgDrF5rp';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { formatCurrency, formatDate } from 'src/app/common/utils/common';
import { Account } from 'src/app/core/models/journal.model';

@Component({
  selector: 'app-grid-view',
  imports: [CommonModule, TitleCasePipe, NgFor, NgIf, AngularSvgIconModule],
  templateUrl: './grid-view.component.html',
  styleUrl: './grid-view.component.scss'
})
export class GridViewComponent {

  @Input()
  treeName = 'assets';
  @Input()
  accounts: Account[] = [];
  @Input()
  accountTotalBalance: number = 0.0;
  @Input()
  columnGrid=1;

  expandedNode: boolean = false;
  formatCurrency=formatCurrency;
  formatDate=formatDate;

  getCategoryColorClass(category: string): string {
    switch (category) {
      case 'assets': return 'text-green-700 bg-green-50 border-green-200';
      case 'liabilities': return 'text-red-700 bg-red-50 border-red-200';
      case 'equity': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'revenue': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'expenses': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  }

  getBalanceColorClass(category: string, balance?: number): string {
    if (category === 'assets') return balance && balance >= 0 ? 'text-green-600' : 'text-red-600';
    if (category === 'liabilities') return 'text-red-600';
    if (category === 'equity') return 'text-blue-600';
    if (category === 'revenue') return 'text-emerald-600';
    if (category === 'expenses') return 'text-orange-600';
    return 'text-gray-600';
  }
  
  getSvgIcon(category: string): string {
    switch (category) {
      case 'assets': return './assets/tree-view-icon/plus.svg';
      case 'liabilities': return './assets/tree-view-icon/minus.svg';
      case 'equity': return './assets/tree-view-icon/shield.svg';
      case 'revenue': return './assets/tree-view-icon/up-curve.svg';
      case 'expenses': return './assets/tree-view-icon/down-curve.svg';
      default: return './assets/tree-view-icon/plus.svg';
    }
  }
}
