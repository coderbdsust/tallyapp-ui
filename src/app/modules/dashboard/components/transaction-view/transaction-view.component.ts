import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { Transaction } from 'src/app/core/models/organization-balance.model';
import { Organization } from 'src/app/core/models/organization.model';

@Component({
  selector: 'app-transaction-view',
  imports: [NgClass, NgIf, NgFor, WordPipe,DatePipe, AngularSvgIconModule],
  templateUrl: './transaction-view.component.html',
  styleUrl: './transaction-view.component.scss'
})
export class TransactionViewComponent {


  @Input()
  public org:Organization| null = null;

  @Input()
  public transactions: Transaction[] = [];
  
  public loading: boolean = false;


  // Utility methods
    getTransactionIndex(index: number): number {
      return index+1;
    }
  
    formatCurrency(amount: number): string {
      return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2
      }).format(amount || 0);
    }
  
    getTransactionParty(txn: Transaction): { name: string; type: string } {
      if (txn.supplierName) {
        return { name: txn.supplierName, type: 'Supplier' };
      }
      if (txn.customerName) {
        return { name: txn.customerName, type: 'Customer' };
      }
      if (txn.employeeName) {
        return { name: txn.employeeName, type: 'Employee' };
      }
      return { name: 'N/A', type: '' };
    }
  
    getAmountColor(type: string, amount: number): string {
      const incomingTypes = ['CASH_IN', 'SALE', 'PAYMENT_RECEIVED', 'REFUND'];
      const outgoingTypes = ['CASH_OUT', 'PURCHASE', 'PAYMENT_MADE', 'EXPENSE', 'EMPLOYEE_EXPENSE'];
      
      if (incomingTypes.includes(type)) {
        return 'text-green-600 font-semibold';
      }
      if (outgoingTypes.includes(type)) {
        return 'text-red-600 font-semibold';
      }
      return 'text-gray-900 font-medium';
    }
  
    // Transaction type styling
    getTransactionTypeColor(type: string): { bg: string; text: string } {
      const colorMap: Record<string, { bg: string; text: string }> = {
        'CASH_IN': { bg: 'bg-green-200', text: 'text-green-800' },
        'CASH_OUT': { bg: 'bg-red-200', text: 'text-red-800' },
        'PURCHASE': { bg: 'bg-purple-100', text: 'text-purple-800' },
        'SALE': { bg: 'bg-blue-100', text: 'text-blue-800' },
        'PAYMENT_RECEIVED': { bg: 'bg-green-200', text: 'text-green-900' },
        'PAYMENT_MADE': { bg: 'bg-red-200', text: 'text-red-900' },
        'EXPENSE': { bg: 'bg-orange-100', text: 'text-orange-800' },
        'REFUND': { bg: 'bg-pink-100', text: 'text-pink-800' },
        'ADJUSTMENT': { bg: 'bg-gray-100', text: 'text-gray-800' },
        'REVERSAL': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        'ACCOUNTS_RECEIVABLE': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
        'EQUITY': { bg: 'bg-teal-100', text: 'text-teal-800' },
        'EMPLOYEE_EXPENSE': { bg: 'bg-rose-100', text: 'text-rose-800' }
      };
  
      return colorMap[type] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    }

}
