import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitedOfferDialogComponent } from './limited-offer-dialog.component';

describe('LimitedOfferDialogComponent', () => {
  let component: LimitedOfferDialogComponent;
  let fixture: ComponentFixture<LimitedOfferDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LimitedOfferDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimitedOfferDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
