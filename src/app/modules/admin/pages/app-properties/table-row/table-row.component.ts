import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppProperties } from '../app-properties.model';

@Component({
  selector: '[app-table-row]',
  standalone: true,
  imports: [FormsModule, AngularSvgIconModule],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.scss',
})
export class TableRowComponent {
  @Input() appProperty: AppProperties = <AppProperties>{};

  constructor() {}
}
