import { Component, signal, computed, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { AppProperties } from './app-properties.model';
import { AppPropertiesService } from './service/app-properties.service';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableFooterComponent } from './table-footer/table-footer.component';
import { TableRowComponent } from './table-row/table-row.component';
import { AppPropertiesTableFilterService } from './service/app-properties-table-filter.service';
import { TableActionComponent } from './table-action/table-action.component';

@Component({
  selector: 'app-app-properties',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormsModule,
    TableHeaderComponent,
    TableFooterComponent,
    TableRowComponent,
    TableActionComponent
  ],
  templateUrl: './app-properties.component.html',
  styleUrl: './app-properties.component.scss',
})
export class AppPropertiesComponent implements OnInit {
  appProperties = signal<AppProperties[]>([]);
  currentRows : number=0;
  totalRows : number=0;


  constructor(private appPropService: AppPropertiesService, private appTableFilterService :AppPropertiesTableFilterService) {}

  ngOnInit(): void {
    this.loadAppProperties();
  }

  private loadAppProperties(){
    this.appPropService.getAppProperties().subscribe({
      next: (response) => {
        this.appProperties.set(response);
        this.totalRows = response.length;
      },
      error: (error) => {
        this.appPropService.showToastErrorResponse(error);
      },
    });
  }

  public toggleProperties(checked: boolean) {
    this.appProperties.update((properties) => {
      return properties.map((property) => {
        return { ...property, selected: checked };
      });
    });
  }
  
  filteredAppProperties = computed(() => {
    const search = this.appTableFilterService.searchField().toLowerCase();
    const rowSize = this.appTableFilterService.rowSize();

    const filteredList = this.appProperties().filter (
      (properties) =>
        properties.appKey.toLowerCase().includes(search) ||
        properties.appValue.toLowerCase().includes(search) ||
        properties.profile.toLowerCase().includes(search)
    );
    let list =  rowSize === -1 ? filteredList : filteredList.slice(0, rowSize);
    this.currentRows = list.length;
    return list;
  });
}
