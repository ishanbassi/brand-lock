import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadCaptureModalComponent } from './lead-capture-modal.component';

describe('LeadCaptureModalComponent', () => {
  let component: LeadCaptureModalComponent;
  let fixture: ComponentFixture<LeadCaptureModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadCaptureModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadCaptureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
