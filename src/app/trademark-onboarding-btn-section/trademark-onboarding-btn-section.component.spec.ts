import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkOnboardingBtnSectionComponent } from './trademark-onboarding-btn-section.component';

describe('TrademarkOnboardingBtnSectionComponent', () => {
  let component: TrademarkOnboardingBtnSectionComponent;
  let fixture: ComponentFixture<TrademarkOnboardingBtnSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkOnboardingBtnSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkOnboardingBtnSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
