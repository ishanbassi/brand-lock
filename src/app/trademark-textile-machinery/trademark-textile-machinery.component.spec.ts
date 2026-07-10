import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkTextileMachineryComponent } from './trademark-textile-machinery.component';

describe('TrademarkTextileMachineryComponent', () => {
  let component: TrademarkTextileMachineryComponent;
  let fixture: ComponentFixture<TrademarkTextileMachineryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkTextileMachineryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkTextileMachineryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
