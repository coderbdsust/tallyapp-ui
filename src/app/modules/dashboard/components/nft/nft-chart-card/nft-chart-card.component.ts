import { Component, OnDestroy, OnInit, effect } from '@angular/core';
import { map, Subscription } from 'rxjs';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ChartOptions } from '../../../../../common/models/chart-options';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Organization } from 'src/app/modules/organization/service/model/organization.model';
import { ProductService } from 'src/app/modules/organization/service/product.service';
import { OrganizationService } from 'src/app/modules/organization/service/organization.service';
import { PageResponse } from 'src/app/common/models/page-response';
import { Product } from 'src/app/modules/organization/service/model/product.model';

@Component({
  selector: '[nft-chart-card]',
  templateUrl: './nft-chart-card.component.html',
  imports: [AngularSvgIconModule, NgApexchartsModule],
})
export class NftChartCardComponent implements OnInit, OnDestroy {
  public organization: Organization | null = null;
  public productResponse: PageResponse<Product> | null = null;
  public chartOptions: Partial<ChartOptions>;

  constructor(
    private themeService: ThemeService,
    private productService: ProductService,
    private orgService: OrganizationService,
  ) {
    let baseColor = '#FFFFFF';
    const data = [2100, 3200, 3200, 2400, 2400, 1800, 1800, 2400, 2400, 3200, 3200, 3000, 3000, 3250, 3250];
    const categories = [
      '10AM',
      '10.30AM',
      '11AM',
      '11.15AM',
      '11.30AM',
      '12PM',
      '1PM',
      '2PM',
      '3PM',
      '4PM',
      '5PM',
      '6PM',
      '7PM',
      '8PM',
      '9PM',
    ];

    this.chartOptions = {
      series: [
        {
          name: 'Products',
          data: data,
        },
      ],
      chart: {
        fontFamily: 'inherit',
        type: 'area',
        height: 150,
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.2,
          stops: [15, 120, 100],
        },
      },
      stroke: {
        curve: 'smooth',
        show: true,
        width: 3,
        colors: [baseColor], // line color
      },
      xaxis: {
        categories: categories,
        labels: {
          show: true,
        },
        crosshairs: {
          position: 'front',
          stroke: {
            color: baseColor,
            width: 1,
            dashArray: 4,
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: function (val) {
            return val + '$';
          },
        },
      },
      colors: [baseColor],
    };

    effect(() => {
      /** change chart theme */
      let primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
      primaryColor = this.HSLToHex(primaryColor);
      this.chartOptions.tooltip = {
        theme: this.themeService.theme().mode,
      };
      this.chartOptions.colors = [primaryColor];
      this.chartOptions.stroke!.colors = [primaryColor];
      this.chartOptions.xaxis!.crosshairs!.stroke!.color = primaryColor;
    });
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if (org) {
        this.organization = org;
        this.loadProductsByOrganization(org.id);
      }
    });
  }

  loadProductsByOrganization(orgId: String) {
    this.productService.getProductByOrganization(orgId, 0, 10, '','').subscribe({
      next: (response) => {
        this.productResponse = response;
        this.mapData(response.content);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
    });
  }

  private HSLToHex(color: string): string {
    const colorArray = color.split('%').join('').split(' ');
    const colorHSL = colorArray.map(Number);
    const hsl = {
      h: colorHSL[0],
      s: colorHSL[1],
      l: colorHSL[2],
    };

    const { h, s, l } = hsl;

    const hDecimal = l / 100;
    const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = hDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

      // Convert to Hex and prefix with "0" if required
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }


  private mapDataWithDate(products: Product[]): { dates: string[], counts: number[] } {
    const dateCountMap: { [key: string]: number } = {};
  
    products.forEach(product => {
      const date = product.createdDate.split('T')[0];
      dateCountMap[date] = (dateCountMap[date] || 0) + 1;
    });
  
    const sortedDates = Object.keys(dateCountMap).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
  
    const dates = sortedDates;
    const counts = sortedDates.map(date => dateCountMap[date]);
  
    return { dates, counts };
  }
  
  


  private mapData(products:Product[]){

    const dataWithDate = this.mapDataWithDate(products);
    this.chartOptions.series = [{
      name: 'Products',
      data: dataWithDate.counts
    }];
    this.chartOptions.xaxis = {
      categories: dataWithDate.dates
    };
  }

  ngOnDestroy(): void {}
}
