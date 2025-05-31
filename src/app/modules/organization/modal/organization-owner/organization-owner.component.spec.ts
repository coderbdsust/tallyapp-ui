import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationOwnerComponent } from './organization-owner.component';

describe('OrganizationOwnerComponent', () => {
  let component: OrganizationOwnerComponent;
  let fixture: ComponentFixture<OrganizationOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationOwnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
