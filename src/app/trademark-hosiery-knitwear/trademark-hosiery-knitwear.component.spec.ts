import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkHosieryKnitwearComponent } from './trademark-hosiery-knitwear.component';

describe('TrademarkHosieryKnitwearComponent', () => {
  let component: TrademarkHosieryKnitwearComponent;
  let fixture: ComponentFixture<TrademarkHosieryKnitwearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkHosieryKnitwearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkHosieryKnitwearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
