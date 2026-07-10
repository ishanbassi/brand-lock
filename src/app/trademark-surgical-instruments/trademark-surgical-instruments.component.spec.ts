import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkSurgicalInstrumentsComponent } from './trademark-surgical-instruments.component';

describe('TrademarkSurgicalInstrumentsComponent', () => {
  let component: TrademarkSurgicalInstrumentsComponent;
  let fixture: ComponentFixture<TrademarkSurgicalInstrumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkSurgicalInstrumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkSurgicalInstrumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
