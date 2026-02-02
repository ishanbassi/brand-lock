import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkPlanCardsComponent } from './trademark-plan-cards.component';

describe('TrademarkPlanCardsComponent', () => {
  let component: TrademarkPlanCardsComponent;
  let fixture: ComponentFixture<TrademarkPlanCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkPlanCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkPlanCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
