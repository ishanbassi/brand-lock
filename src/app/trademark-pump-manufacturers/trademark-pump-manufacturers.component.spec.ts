import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkPumpManufacturersComponent } from './trademark-pump-manufacturers.component';

describe('TrademarkPumpManufacturersComponent', () => {
  let component: TrademarkPumpManufacturersComponent;
  let fixture: ComponentFixture<TrademarkPumpManufacturersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkPumpManufacturersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkPumpManufacturersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
