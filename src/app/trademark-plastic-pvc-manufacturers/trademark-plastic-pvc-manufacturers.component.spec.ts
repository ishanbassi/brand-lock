import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkPlasticPvcManufacturersComponent } from './trademark-plastic-pvc-manufacturers.component';

describe('TrademarkPlasticPvcManufacturersComponent', () => {
  let component: TrademarkPlasticPvcManufacturersComponent;
  let fixture: ComponentFixture<TrademarkPlasticPvcManufacturersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkPlasticPvcManufacturersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkPlasticPvcManufacturersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
