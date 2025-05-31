import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Organization, OrganizationOwner, UserForOrganization } from '../../service/model/organization.model';
import { OrganizationService } from '../../service/organization.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'src/app/common/components/button/button.component';

@Component({
  selector: 'app-organization-owner',
  imports: [ AngularSvgIconModule, CommonModule, ButtonComponent],
  templateUrl: './organization-owner.component.html',
  styleUrl: './organization-owner.component.scss'
})
export class OrganizationOwnerComponent {

  constructor(
    public dialogRef: MatDialogRef<OrganizationOwnerComponent>,
    @Inject(MAT_DIALOG_DATA) public organization: Organization,
    public organizationService: OrganizationService
  ) {
    this.organization = organization;
    this.loadOwnersByOrganizationId(organization);
  }

  public orgOwners : OrganizationOwner | null = null;

  loadOwnersByOrganizationId(org:Organization) {
    this.organizationService.getAllOwnersByOrganization(org.id).subscribe({
      next: (owners) => {
        this.orgOwners = owners;
      },
      error: (error) => {
      }
    });
  }

  removeOwnerFromOrganization(owner: UserForOrganization) {
    const owners = owner ? [owner.id] : [];
    
    if (owners.length === 0) {
      console.error('No owner selected for removal');
      return;
    }

    this.organizationService.removeOwnerFromOrganization(this.organization.id, owners).subscribe({
      next: (response) => {
        this.loadOwnersByOrganizationId(this.organization);
      },
      error: (error) => {
       this.organizationService.showToastErrorResponse(error);
      }
    });
  }

  close(){
    this.dialogRef.close();
  }
}
