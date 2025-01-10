import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAppPropertiesComponent } from './edit-app-properties.component';

describe('EditAppPropertiesComponent', () => {
  let component: EditAppPropertiesComponent;
  let fixture: ComponentFixture<EditAppPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAppPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAppPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
