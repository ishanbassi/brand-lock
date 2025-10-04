import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSuccessFailurePopupComponent } from './payment-success-failure-popup.component';

describe('PaymentSuccessFailurePopupComponent', () => {
  let component: PaymentSuccessFailurePopupComponent;
  let fixture: ComponentFixture<PaymentSuccessFailurePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSuccessFailurePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentSuccessFailurePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
