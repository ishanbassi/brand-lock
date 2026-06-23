import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkSportsGoodsComponent } from './trademark-sports-goods.component';

describe('TrademarkSportsGoodsComponent', () => {
  let component: TrademarkSportsGoodsComponent;
  let fixture: ComponentFixture<TrademarkSportsGoodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkSportsGoodsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkSportsGoodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
