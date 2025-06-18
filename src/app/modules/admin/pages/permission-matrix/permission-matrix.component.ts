import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-permission-matrix',
  imports: [NgFor, CommonModule],
  templateUrl: './permission-matrix.component.html',
  styleUrl: './permission-matrix.component.scss'
})
export class PermissionMatrixComponent {


  public modules = ["USER_MANAGEMENT", "EMPLOYEE", "INVENTORY", "ORGANIZATION", "INVOICE", "REPORTS"];
  public roles = ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER", "VIEWER"];

  onAssignModulePermission(module: string, role: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    console.log(`Module: ${module}, Role: ${role}, Checked: ${isChecked}`);
  }

}
