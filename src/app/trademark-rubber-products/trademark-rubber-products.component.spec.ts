import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkRubberProductsComponent } from './trademark-rubber-products.component';

describe('TrademarkRubberProductsComponent', () => {
  let component: TrademarkRubberProductsComponent;
  let fixture: ComponentFixture<TrademarkRubberProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkRubberProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkRubberProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
