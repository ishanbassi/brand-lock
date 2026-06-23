import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkBicyclePartsComponent } from './trademark-bicycle-parts.component';

describe('TrademarkBicyclePartsComponent', () => {
  let component: TrademarkBicyclePartsComponent;
  let fixture: ComponentFixture<TrademarkBicyclePartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkBicyclePartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkBicyclePartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
