import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkLockManufacturersComponent } from './trademark-lock-manufacturers.component';

describe('TrademarkLockManufacturersComponent', () => {
  let component: TrademarkLockManufacturersComponent;
  let fixture: ComponentFixture<TrademarkLockManufacturersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkLockManufacturersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkLockManufacturersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
