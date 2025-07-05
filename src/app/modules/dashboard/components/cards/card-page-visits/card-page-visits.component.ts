import { Component, Input, OnInit } from '@angular/core';
import { Organization } from 'src/app/modules/organization/service/model/organization.model';
import { OrganizationBalance, Transaction } from '../../../models/organization-balance';
import { CommonModule, NgFor } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { AccountingService } from '../../../service/accounting.service';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { OrganizationService } from 'src/app/modules/organization/service/organization.service';

@Component({
  selector: 'app-card-page-visits',
  templateUrl: './card-page-visits.component.html',
  styleUrl: './card-page-visits.component.scss',
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule, WordPipe],
})
export class CardPageVisitsComponent extends PaginatedComponent<Transaction> implements OnInit {
  public organization: Organization | null = null;
  search: string = '';
  allTransactionTypes: string[] = [];
  startDate: string | null = null;
  endDate: string | null = null;
  transactionType: string = '';

  constructor(private orgService: OrganizationService, private accService: AccountingService) {
    super();
  }

  ngOnInit(): void {
    this.accService.getTransactionType().subscribe({
      next: (data: string[]) => {
        this.allTransactionTypes = data;
      },
      error: (error) => {
        console.error('Error fetching transaction types:', error);
      },
    });

    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.organization = org;
        this.loadTransactionSummary(
          this.transactionType,
          this.startDate,
          this.endDate,
          this.currentPage,
          this.selectedRows,
        );
      }
    });
  }

  onSelectTxnTypeChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {
      this.transactionType = selectedValue;
    } else {
      this.transactionType = '';
    }
    this.loadTransactionSummary(
      this.transactionType,
      this.startDate,
      this.endDate,
      this.currentPage,
      this.selectedRows,
    );
  }

  onStartDateChange(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.startDate = input ? input : null;
    this.loadTransactionSummary(
      this.transactionType,
      this.startDate,
      this.endDate,
      this.currentPage,
      this.selectedRows,
    );
  }

  onEndDateChange(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.endDate = input ? input : null;
    this.loadTransactionSummary(
      this.transactionType,
      this.startDate,
      this.endDate,
      this.currentPage,
      this.selectedRows,
    );
  }

  onSearchChange(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.loadTransactionSummary(
      this.transactionType,
      this.startDate,
      this.endDate,
      this.currentPage,
      this.selectedRows,
    );
  }

  onSelectChange(event: Event) {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedRows = rows === -1 ? this.totalRows || 0 : rows;
    this.loadTransactionSummary(
      this.transactionType,
      this.startDate,
      this.endDate,
      this.currentPage,
      this.selectedRows,
    );
  }

  goToPreviousPage() {
    if (!this.first) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToNextPage() {
    if (!this.last) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  private updatePagination() {
    this.loadTransactionSummary(
      this.transactionType,
      this.startDate,
      this.endDate,
      this.currentPage,
      this.selectedRows,
    );
  }

  loadTransactionSummary(
    transactionType: string = '',
    startDate: string | null = null,
    endDate: string | null = null,
    page: number = 0,
    size: number = 10,
  ) {
    if (this.organization) {
      this.accService
        .getTransactionSummaryByPage(this.organization.id, transactionType, startDate, endDate, page, size)
        .subscribe({
          next: (response) => {
            this.pageResponse = response;
          },
          error: (error) => {
            console.error('Error fetching transaction summary:', error);
          },
        });
    }
  }

  getTransactionTypeColor(type: string): { bg: string; text: string } {
    switch (type) {
      case 'CASH_IN':
        return { bg: 'bg-green-200', text: 'text-green-800' };
      case 'CASH_OUT':
        return { bg: 'bg-red-200', text: 'text-red-800' };
      case 'PURCHASE':
        return { bg: 'bg-purple-100', text: 'text-purple-800' };
      case 'SALE':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'PAYMENT_RECEIVED':
        return { bg: 'bg-green-200', text: 'text-green-900' };
      case 'PAYMENT_MADE':
        return { bg: 'bg-red-200', text: 'text-red-900' };
      case 'EXPENSE':
        return { bg: 'bg-red-200', text: 'text-yellow-800' };
      case 'REFUND':
        return { bg: 'bg-pink-100', text: 'text-pink-800' };
      case 'ADJUSTMENT':
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
      case 'REVERSAL':
        return { bg: 'bg-orange-100', text: 'text-orange-800' };
      case 'ACCOUNTS_RECEIVABLE':
        return { bg: 'bg-indigo-100', text: 'text-indigo-800' };
      case 'EQUITY':
        return { bg: 'bg-teal-100', text: 'text-teal-800' };
      case 'EMPLOYEE_EXPENSE':
        return { bg: 'bg-rose-100', text: 'text-rose-800' };
      default:
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    }
  }
}
