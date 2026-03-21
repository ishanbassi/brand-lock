import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitOtpComponent } from './submit-otp.component';

describe('SubmitOtpComponent', () => {
  let component: SubmitOtpComponent;
  let fixture: ComponentFixture<SubmitOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
