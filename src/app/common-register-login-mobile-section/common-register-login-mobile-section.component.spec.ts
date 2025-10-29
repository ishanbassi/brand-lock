import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonRegisterLoginMobileSectionComponent } from './common-register-login-mobile-section.component';

describe('CommonRegisterLoginMobileSectionComponent', () => {
  let component: CommonRegisterLoginMobileSectionComponent;
  let fixture: ComponentFixture<CommonRegisterLoginMobileSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonRegisterLoginMobileSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonRegisterLoginMobileSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
