import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkPulseComponent } from './trademark-pulse.component';

describe('TrademarkPulseComponent', () => {
  let component: TrademarkPulseComponent;
  let fixture: ComponentFixture<TrademarkPulseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkPulseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkPulseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
