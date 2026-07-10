import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkBrasswareManufacturersComponent } from './trademark-brassware-manufacturers.component';

describe('TrademarkBrasswareManufacturersComponent', () => {
  let component: TrademarkBrasswareManufacturersComponent;
  let fixture: ComponentFixture<TrademarkBrasswareManufacturersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkBrasswareManufacturersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkBrasswareManufacturersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
