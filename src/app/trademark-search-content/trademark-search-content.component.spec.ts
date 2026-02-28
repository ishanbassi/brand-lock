import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkSearchContentComponent } from './trademark-search-content.component';

describe('TrademarkSearchContentComponent', () => {
  let component: TrademarkSearchContentComponent;
  let fixture: ComponentFixture<TrademarkSearchContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkSearchContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkSearchContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
