// dropdown.component.ts
import { Component, Input, Output, EventEmitter, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrawerService } from 'src/app/core/services/drawer.service';

export interface DropdownOption {
  default?:boolean;
  type?:string;
  label: string;
  value: string | number;
  description?: string;
  icon?: string;
}

@Component({
  selector: 'app-dropdown',
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {
  @Input() options: DropdownOption[] = [];
  @Input() selectedOption: DropdownOption | null = null;
  @Input() placeholder: string = 'Select an option';
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() error: string = '';
  @Input() required: boolean = false;
  @Input() addButtonText: string = 'Add New';
  
  @Output() selectedOptionChange = new EventEmitter<DropdownOption | null>();
  @Output() onSelect = new EventEmitter<DropdownOption>();
  @Output() onAddNew = new EventEmitter<void>();
  
  isOpen: boolean = false;
  searchTerm: string = '';
  filteredOptions: DropdownOption[] = [];

  constructor(
    private elementRef: ElementRef,
    private drawerService: DrawerService
  ) {}

  ngOnInit(): void {
    this.filteredOptions = [...this.options];
  }

  ngOnChanges(): void {
    this.filterOptions();
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.searchTerm = '';
        this.filterOptions();
      }
    }
  }

  selectOption(option: DropdownOption): void {
    this.selectedOption = option;
    this.selectedOptionChange.emit(option);
    this.onSelect.emit(option);
    this.isOpen = false;
    this.searchTerm = '';
  }

  openAddNewDrawer(): void {
    this.isOpen = false;
    this.onAddNew.emit();
    this.drawerService.open({
      title: `Add New ${this.label || 'Option'}`,
      onSubmit: (data: any) => {
        this.handleNewOption(data);
      }
    });
  }

  handleNewOption(data: any): void {
    const newOption: DropdownOption = {
      label: data.name,
      value: data.value || data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description
    };
    
    this.options = [...this.options, newOption];
    this.selectOption(newOption);
    this.filterOptions();
  }

  filterOptions(): void {
    if (!this.searchTerm) {
      this.filteredOptions = [...this.options];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredOptions = this.options.filter(option =>
        option.label.toLowerCase().includes(term) ||
        option.description?.toLowerCase().includes(term)
      );
    }
  }

  clearSelection(): void {
    this.selectedOption = null;
    this.selectedOptionChange.emit(null);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}