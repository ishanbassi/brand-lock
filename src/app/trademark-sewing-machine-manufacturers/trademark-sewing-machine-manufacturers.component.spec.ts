import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkSewingMachineManufacturersComponent } from './trademark-sewing-machine-manufacturers.component';

describe('TrademarkSewingMachineManufacturersComponent', () => {
  let component: TrademarkSewingMachineManufacturersComponent;
  let fixture: ComponentFixture<TrademarkSewingMachineManufacturersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkSewingMachineManufacturersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkSewingMachineManufacturersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
