import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Module, NewRole, RoleResponse } from './permission.model';
import { GetIconPipe } from 'src/app/common/pipes/get.icon.pipe';
import { PermissionService } from '../../../../core/services/permission.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-permission-matrix',
  imports: [NgFor, CommonModule, FormsModule, LucideAngularModule, GetIconPipe, AngularSvgIconModule],
  templateUrl: './permission-matrix.component.html',
  styleUrl: './permission-matrix.component.scss'
})
export class PermissionMatrixComponent implements OnInit{

  public modules: Module[]=[];
  public roles: RoleResponse[]=[];
  isAddingRole: boolean = false;
  editingRole: string | null = null;
  newRole: NewRole = { name: '', description: '', modules: [] };
  hasChanges: boolean = false;

  constructor(private permissionService: PermissionService){}

  ngOnInit(): void {
    this.loadModules();
    this.loadRoles();
  }

  loadModules(){
    this.permissionService.getAvailableModules().subscribe({
      next:(moduleRes)=>{
        this.modules = moduleRes;
      },
      error:(errRes)=>(this.permissionService.showToastError(errRes))
    })
  }

  loadRoles(){
    this.permissionService.getAvailableRoles().subscribe({
      next:(roles)=>{
        this.roles = roles;
      },
      error:(errRes)=>(this.permissionService.showToastError(errRes))
    })
  }

  addNewRole(){
    this.isAddingRole = true;
  }

  addRole(): void {
    if (this.newRole.name.trim()) {
      this.permissionService.createRole(this.newRole).subscribe({
        next:(roleRes)=>{
          this.loadRoles();
          this.newRole = { name: '', description: '', modules: [] };
          this.isAddingRole = false;
        },
        error:(errRes)=>{
          this.isAddingRole = false;
          this.permissionService.showToastErrorResponse(errRes);
        }
      });      
    }
  }

  closeAddRoleModal(): void {
    this.isAddingRole = false;
    this.newRole = { name: '', description: '', modules: [] };
  }

  setEditingRole(roleId: string): void {
    this.editingRole = roleId;
  }

  isModuleAssigned(role:RoleResponse, module:Module){
    return role.modules.includes(module.name);
  }

  onAssignModulePermission(module: Module, role: RoleResponse, event: Event) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    // console.log(`Module: ${module.name}, Role: ${role.name}, Checked: ${isChecked}`);
    if(isChecked){
      this.permissionService.assignModule(role.id, module.name).subscribe({
        next:(roleRes)=>{
          this.loadRoles();
        },error:(errRes)=>{
          this.loadRoles();
          this.permissionService.showToastErrorResponse(errRes);
        }
      })
    }else{
      this.permissionService.removeModule(role.id, module.name).subscribe({
        next:(roleRes)=>{
          this.loadRoles();
        },error:(errRes)=>{
          this.loadRoles();
          this.permissionService.showToastErrorResponse(errRes);
        }
      })
    }
  }
}