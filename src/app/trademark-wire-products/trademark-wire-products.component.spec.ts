import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkWireProductsComponent } from './trademark-wire-products.component';

describe('TrademarkWireProductsComponent', () => {
  let component: TrademarkWireProductsComponent;
  let fixture: ComponentFixture<TrademarkWireProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkWireProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkWireProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
