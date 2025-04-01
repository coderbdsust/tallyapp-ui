import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignOrganizationComponent } from './assign-organization.component';

describe('AssignOrganizationComponent', () => {
  let component: AssignOrganizationComponent;
  let fixture: ComponentFixture<AssignOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignOrganizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
