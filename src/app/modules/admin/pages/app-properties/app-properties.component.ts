import { Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { AppProperties } from './app-properties.model';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { Subject, takeUntil } from 'rxjs';
import { AppPropertiesService } from 'src/app/core/services/app-properties.service';
import { EditAppPropertiesComponent } from './modal/edit-app-properties.component';

@Component({
  selector: 'app-app-properties',
  imports: [AngularSvgIconModule, FormsModule, CommonModule, EditAppPropertiesComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app-properties.component.html',
  styleUrl: './app-properties.component.scss'
})
export class AppPropertiesComponent extends PaginatedComponent<AppProperties> implements OnInit, OnDestroy {
  search: string = '';
  loading: boolean = false;
  appProperty!: AppProperties;

  @ViewChild('modal', { static: false }) modal!: EditAppPropertiesComponent;

  private destroy$ = new Subject<void>();

  constructor(
    private appPropService: AppPropertiesService, 
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Abstract method implementation
  loadData(): void {
    this.loading = true;
    this.appPropService
      .getAppProperties(this.currentPage, this.selectedRows, this.search)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.appPropService.showToastErrorResponse(error);
        },
      });
  }

  // Event handlers
  onSearchChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  // App property actions
  handleEdit(appProperty: AppProperties): void {
    this.appProperty = appProperty;
    this.modal.openModal();
  }

  handleDelete(appProperty: AppProperties): void {
    this.authService.showToastError('Delete functionality not implemented yet');
  }

  addProperty(): void {
    this.authService.showToastError('Add property functionality not implemented yet');
  }

  // Utility methods
  getPropertyIndex(index: number): number {
    return index + this.startIndex;
  }

  getProfileColor(profile: string): string {
    const profileColors: Record<string, string> = {
      'dev': 'bg-yellow-100 text-blue-800',
      'stage': 'bg-blue-100 text-yellow-800',
      'prod': 'bg-green-100 text-green-800',
      'test': 'bg-purple-100 text-purple-800',
      'default': 'bg-gray-100 text-gray-800'
    };

    return profileColors[profile.toLowerCase()] || profileColors['default'];
  }

  getValuePreview(value: string, maxLength: number = 20): string {
    if (!value) return 'N/A';
    return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
  }

  isValueTruncated(value: string, maxLength: number = 20): boolean {
    return !!value && value.length > maxLength;
  }

  formatAppKey(key: string): string {
    // Format camelCase or snake_case to display format
    return key.replace(/([A-Z])/g, ' $1')
              .replace(/_/g, ' ')
              .toLowerCase()
              .replace(/\b\w/g, l => l.toUpperCase());
  }

  getValueType(value: string): string {
    if (!value) return 'empty';
    
    // Check if it's a URL
    if (value.startsWith('http://') || value.startsWith('https://')) return 'url';
    
    // Check if it's a number
    if (!isNaN(Number(value))) return 'number';
    
    // Check if it's boolean
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') return 'boolean';
    
    // Check if it's JSON
    try {
      JSON.parse(value);
      return 'json';
    } catch {
      // Not JSON
    }
    
    return 'text';
  }

  getValueIcon(value: string): string {
    const type = this.getValueType(value);
    const icons: Record<string, string> = {
      'url': 'link',
      'number': 'hashtag',
      'boolean': 'check-circle',
      'json': 'code-bracket',
      'text': 'document-text',
      'empty': 'minus-circle'
    };
    
    return `./assets/icons/heroicons/outline/${icons[type] || 'document-text'}.svg`;
  }
}