import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkSelectClassComponent } from './trademark-select-class.component';

describe('TrademarkSelectClassComponent', () => {
  let component: TrademarkSelectClassComponent;
  let fixture: ComponentFixture<TrademarkSelectClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkSelectClassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkSelectClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
