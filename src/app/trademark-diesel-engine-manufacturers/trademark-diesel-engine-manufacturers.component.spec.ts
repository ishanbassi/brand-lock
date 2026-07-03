import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkDieselEngineManufacturersComponent } from './trademark-diesel-engine-manufacturers.component';

describe('TrademarkDieselEngineManufacturersComponent', () => {
  let component: TrademarkDieselEngineManufacturersComponent;
  let fixture: ComponentFixture<TrademarkDieselEngineManufacturersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkDieselEngineManufacturersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkDieselEngineManufacturersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
