import { Component, Input } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppPropertiesTableFilterService } from '../service/app-properties-table-filter.service';

@Component({
  selector: 'app-table-action',
  standalone: true,
  imports: [AngularSvgIconModule],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.scss',
})
export class TableActionComponent {

  @Input() totalRows:number = 100;
  @Input() currentRows:number = 10;


  constructor(public appTableFilterService: AppPropertiesTableFilterService) {}

  onSearchChange(value: Event) {
    const input = value.target as HTMLInputElement;
    this.appTableFilterService.searchField.set(input.value);
  }

  onStatusChange(value: Event) {
    const selectElement = value.target as HTMLSelectElement;
    this.appTableFilterService.statusField.set(selectElement.value);
  }

  onOrderChange(value: Event) {
    const selectElement = value.target as HTMLSelectElement;
    this.appTableFilterService.orderField.set(selectElement.value);
  }
}
