import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductListComponent } from './pages/product-list/product-list.component';

@Component({
  selector: 'app-product',
  imports: [ProductListComponent, NgIf, NgFor],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  activeTab = 'product-list';
    private subscription = new Subscription();
  
    tabs = [
      { id: 'product-list', label: 'Product List' }
    ];
  
    constructor(
      private router: Router,
      private route: ActivatedRoute
    ) {}
  
    ngOnInit() {
      // Subscribe to query parameter changes
      const queryParamSub = this.route.queryParams.subscribe(params => {
        // console.log('Transaction component received query params:', params);
        
        const tab = params['tab'];
        if (tab && this.tabs.some(t => t.id === tab)) {
          this.activeTab = tab;
          // console.log('Setting active tab to:', tab);
        } else {
          // If no valid tab specified, default to cash-in and update URL
          this.activeTab = 'product-list';
          this.updateQueryParam('product-list', true); // true = replace URL
        }
      });
      
      this.subscription.add(queryParamSub);
    }
  
    setActiveTab(tabId: string) {
      // console.log('Setting active tab via click:', tabId);
      this.activeTab = tabId;
      this.updateQueryParam(tabId, false); // false = don't replace URL
    }
  
    private updateQueryParam(tabId: string, replaceUrl: boolean = false) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: tabId },
        queryParamsHandling: 'replace', // Always replace to ensure clean URL
        replaceUrl: replaceUrl // Only replace browser history on initial load
      });
    }
  
    ngOnDestroy() {
      this.subscription.unsubscribe();
    }
}
