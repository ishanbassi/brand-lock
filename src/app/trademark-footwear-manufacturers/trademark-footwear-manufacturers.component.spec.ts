import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkFootwearManufacturersComponent } from './trademark-footwear-manufacturers.component';

describe('TrademarkFootwearManufacturersComponent', () => {
  let component: TrademarkFootwearManufacturersComponent;
  let fixture: ComponentFixture<TrademarkFootwearManufacturersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkFootwearManufacturersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkFootwearManufacturersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
