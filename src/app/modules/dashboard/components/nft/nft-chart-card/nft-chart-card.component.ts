import { Component, OnDestroy, OnInit, effect } from '@angular/core';
import { map, Subscription } from 'rxjs';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ChartOptions } from '../../../../../common/models/chart-options';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Organization } from 'src/app/core/models/organization.model';
import { ProductService } from 'src/app/core/services/product.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { PageResponse } from 'src/app/common/models/page-response';
import { Product, ProductStatistics } from 'src/app/core/models/product.model';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: '[nft-chart-card]',
  templateUrl: './nft-chart-card.component.html',
  imports: [AngularSvgIconModule, NgApexchartsModule, NgFor],
})
export class NftChartCardComponent implements OnInit, OnDestroy {
  public organization: Organization | null = null;
  public productResponse: PageResponse<Product> | null = null;
  public productStatistics: ProductStatistics | null = null;
  currentSlide = 0;
  private intervalId: any;

  constructor(
    private productService: ProductService,
    private orgService: OrganizationService,
  ) {

  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.organization = org;
        this.productStatistics = null;
        this.loadProductStatistics(org.id);
        this.loadProductsByOrganization(org.id);
      }
    });
    this.startAutoSlide();
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 2000);
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    if (this.productResponse?.content?.length) {
      this.currentSlide = (this.currentSlide + 1) % this.productResponse.content.length;
    }
  }

  prevSlide() {
    if (this.productResponse?.content?.length) {
      this.currentSlide = this.currentSlide === 0
        ? this.productResponse.content.length - 1
        : this.currentSlide - 1;
    }
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  onMouseEnter() {
    this.stopAutoSlide();
  }

  onMouseLeave() {
    this.startAutoSlide();
  }


  loadProductStatistics(orgId: string) {
    this.productService.getProductStatistics(orgId).subscribe({
      next: (response) => {
        this.productStatistics = response;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  loadProductsByOrganization(orgId: String) {
    this.productService.getProductByOrganization(orgId, 0, 10, '', '').subscribe({
      next: (response) => {
        this.productResponse = response;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
    });
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }
}
