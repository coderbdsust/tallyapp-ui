import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Organization } from 'src/app/core/models/organization.model';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { ReportService } from 'src/app/core/services/report.service';
import { formatCurrency } from 'src/app/common/utils/common';
import {
  ArAgingReport,
  ProfitAndLossReport,
  TaxVatReport,
  TrialBalanceReport
} from 'src/app/core/models/report.model';

@Component({
  selector: 'app-financial-report',
  standalone: true,
  imports: [CommonModule, FormsModule, AngularSvgIconModule],
  templateUrl: './financial-report.component.html',
  styleUrl: './financial-report.component.scss'
})
export class FinancialReportComponent implements OnInit, OnDestroy {
  organization: Organization | null = null;
  formatCurrency = formatCurrency;

  activeReport: 'profit-loss' | 'trial-balance' | 'tax-vat' | 'ar-aging' = 'profit-loss';

  reportTabs = [
    { id: 'profit-loss' as const, label: 'Profit & Loss' },
    { id: 'trial-balance' as const, label: 'Trial Balance' },
    { id: 'tax-vat' as const, label: 'Tax / VAT' },
    { id: 'ar-aging' as const, label: 'AR Aging' }
  ];

  // Date filters
  startDate: string = '';
  endDate: string = '';

  // Report data
  profitLossReport: ProfitAndLossReport | null = null;
  trialBalanceReport: TrialBalanceReport | null = null;
  taxVatReport: TaxVatReport | null = null;
  arAgingReport: ArAgingReport | null = null;

  loading = false;
  downloading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly orgService: OrganizationService,
    private readonly reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.setDefaultDateRange();
    this.orgService.organization$
      .pipe(takeUntil(this.destroy$))
      .subscribe(org => {
        if (org) {
          this.organization = org;
          this.loadActiveReport();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveReport(reportId: typeof this.activeReport): void {
    this.activeReport = reportId;
    this.loadActiveReport();
  }

  private setDefaultDateRange(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    this.startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    this.endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }

  onDateChange(): void {
    if (this.startDate && this.endDate) {
      this.loadActiveReport();
    }
  }

  loadActiveReport(): void {
    if (!this.organization) return;
    const orgId = this.organization.id;

    switch (this.activeReport) {
      case 'profit-loss':
        this.loadProfitAndLoss(orgId);
        break;
      case 'trial-balance':
        this.loadTrialBalance(orgId);
        break;
      case 'tax-vat':
        this.loadTaxVat(orgId);
        break;
      case 'ar-aging':
        this.loadArAging(orgId);
        break;
    }
  }

  private loadProfitAndLoss(orgId: string): void {
    if (!this.startDate || !this.endDate) return;
    this.loading = true;
    this.reportService.getProfitAndLoss(orgId, this.startDate, this.endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => { this.profitLossReport = data; this.loading = false; },
        error: err => { this.loading = false; this.reportService.showToastErrorResponse(err); }
      });
  }

  private loadTrialBalance(orgId: string): void {
    if (!this.startDate || !this.endDate) return;
    this.loading = true;
    this.reportService.getTrialBalance(orgId, this.startDate, this.endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => { this.trialBalanceReport = data; this.loading = false; },
        error: err => { this.loading = false; this.reportService.showToastErrorResponse(err); }
      });
  }

  private loadTaxVat(orgId: string): void {
    if (!this.startDate || !this.endDate) return;
    this.loading = true;
    this.reportService.getTaxVat(orgId, this.startDate, this.endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => { this.taxVatReport = data; this.loading = false; },
        error: err => { this.loading = false; this.reportService.showToastErrorResponse(err); }
      });
  }

  private loadArAging(orgId: string): void {
    this.loading = true;
    this.reportService.getArAging(orgId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => { this.arAgingReport = data; this.loading = false; },
        error: err => { this.loading = false; this.reportService.showToastErrorResponse(err); }
      });
  }

  downloadPdf(): void {
    if (!this.organization) return;
    const orgId = this.organization.id;
    this.downloading = true;

    let download$;
    let filename: string;

    switch (this.activeReport) {
      case 'profit-loss':
        download$ = this.reportService.downloadProfitAndLoss(orgId, this.startDate, this.endDate);
        filename = `profit-and-loss-${orgId}.pdf`;
        break;
      case 'trial-balance':
        download$ = this.reportService.downloadTrialBalance(orgId, this.startDate, this.endDate);
        filename = `trial-balance-${orgId}.pdf`;
        break;
      case 'tax-vat':
        download$ = this.reportService.downloadTaxVat(orgId, this.startDate, this.endDate);
        filename = `tax-vat-report-${orgId}.pdf`;
        break;
      case 'ar-aging':
        download$ = this.reportService.downloadArAging(orgId);
        filename = `ar-aging-report-${orgId}.pdf`;
        break;
    }

    download$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (pdfBlob: Blob) => {
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloading = false;
      },
      error: err => {
        this.downloading = false;
        this.reportService.showToastErrorResponse(err);
      }
    });
  }

  needsDateFilter(): boolean {
    return this.activeReport !== 'ar-aging';
  }

  getAgingBucketLabel(bucket: string): string {
    const labels: Record<string, string> = {
      'CURRENT': 'Current',
      '1_30_DAYS': '1-30 Days',
      '31_60_DAYS': '31-60 Days',
      '61_90_DAYS': '61-90 Days',
      'OVER_90_DAYS': 'Over 90 Days'
    };
    return labels[bucket] || bucket;
  }

  getAgingBucketColor(bucket: string): string {
    const colors: Record<string, string> = {
      'CURRENT': 'bg-green-100 text-green-800',
      '1_30_DAYS': 'bg-yellow-100 text-yellow-800',
      '31_60_DAYS': 'bg-orange-100 text-orange-800',
      '61_90_DAYS': 'bg-red-100 text-red-800',
      'OVER_90_DAYS': 'bg-red-200 text-red-900'
    };
    return colors[bucket] || 'bg-gray-100 text-gray-800';
  }

  getAccountTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'ASSET': 'bg-blue-100 text-blue-800',
      'LIABILITY': 'bg-purple-100 text-purple-800',
      'EQUITY': 'bg-teal-100 text-teal-800',
      'REVENUE': 'bg-green-100 text-green-800',
      'EXPENSE': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }
}
