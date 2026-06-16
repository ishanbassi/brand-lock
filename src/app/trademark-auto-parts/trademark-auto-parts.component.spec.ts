import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkAutoPartsComponent } from './trademark-auto-parts.component';

describe('TrademarkAutoPartsComponent', () => {
  let component: TrademarkAutoPartsComponent;
  let fixture: ComponentFixture<TrademarkAutoPartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkAutoPartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkAutoPartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
