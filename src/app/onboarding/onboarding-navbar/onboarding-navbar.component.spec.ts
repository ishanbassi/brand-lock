import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingNavbarComponent } from './onboarding-navbar.component';

describe('OnboardingNavbarComponent', () => {
  let component: OnboardingNavbarComponent;
  let fixture: ComponentFixture<OnboardingNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
