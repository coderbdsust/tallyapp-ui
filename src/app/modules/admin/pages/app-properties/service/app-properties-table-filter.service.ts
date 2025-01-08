import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppPropertiesTableFilterService {
  searchField = signal<string>('');
  statusField = signal<string>('');
  orderField = signal<string>('');
  rowSize = signal<number>(10);

  constructor() {}
}
