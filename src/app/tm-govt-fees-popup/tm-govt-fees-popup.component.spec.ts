import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmGovtFeesPopupComponent } from './tm-govt-fees-popup.component';

describe('TmGovtFeesPopupComponent', () => {
  let component: TmGovtFeesPopupComponent;
  let fixture: ComponentFixture<TmGovtFeesPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmGovtFeesPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmGovtFeesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
