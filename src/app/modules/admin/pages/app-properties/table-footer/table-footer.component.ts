import { Component } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppPropertiesTableFilterService } from '../service/app-properties-table-filter.service';

@Component({
  selector: 'app-table-footer',
  standalone: true,
  imports: [AngularSvgIconModule],
  templateUrl: './table-footer.component.html',
  styleUrl: './table-footer.component.scss',
})
export class TableFooterComponent {

  constructor(public appTableFilterService: AppPropertiesTableFilterService) {}
  
    onSelectChange(event: Event) {
      const selectElement = event.target as HTMLSelectElement;
      this.appTableFilterService.rowSize.set(parseInt(selectElement.value));
    }
}
