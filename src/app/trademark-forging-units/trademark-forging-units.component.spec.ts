import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkForgingUnitsComponent } from './trademark-forging-units.component';

describe('TrademarkForgingUnitsComponent', () => {
  let component: TrademarkForgingUnitsComponent;
  let fixture: ComponentFixture<TrademarkForgingUnitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkForgingUnitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkForgingUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
