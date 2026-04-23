import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkSearchResultComponent } from './trademark-search-result.component';

describe('TrademarkSearchResultComponent', () => {
  let component: TrademarkSearchResultComponent;
  let fixture: ComponentFixture<TrademarkSearchResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkSearchResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
