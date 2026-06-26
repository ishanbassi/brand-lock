import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkSteelManufacturersComponent } from './trademark-steel-manufacturers.component';

describe('TrademarkSteelManufacturersComponent', () => {
  let component: TrademarkSteelManufacturersComponent;
  let fixture: ComponentFixture<TrademarkSteelManufacturersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkSteelManufacturersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkSteelManufacturersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
