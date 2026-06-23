import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkAgriculturalEquipmentComponent } from './trademark-agricultural-equipment.component';

describe('TrademarkAgriculturalEquipmentComponent', () => {
  let component: TrademarkAgriculturalEquipmentComponent;
  let fixture: ComponentFixture<TrademarkAgriculturalEquipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkAgriculturalEquipmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkAgriculturalEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
