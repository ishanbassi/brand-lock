import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkScientificInstrumentsComponent } from './trademark-scientific-instruments.component';

describe('TrademarkScientificInstrumentsComponent', () => {
  let component: TrademarkScientificInstrumentsComponent;
  let fixture: ComponentFixture<TrademarkScientificInstrumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkScientificInstrumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkScientificInstrumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
