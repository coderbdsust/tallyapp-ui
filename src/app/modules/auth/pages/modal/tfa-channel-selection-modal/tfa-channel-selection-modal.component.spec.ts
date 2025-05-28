import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TfaChannelSelectionModalComponent } from './tfa-channel-selection-modal.component';

describe('TfaChannelSelectionModalComponent', () => {
  let component: TfaChannelSelectionModalComponent;
  let fixture: ComponentFixture<TfaChannelSelectionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TfaChannelSelectionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TfaChannelSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
