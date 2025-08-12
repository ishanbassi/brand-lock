import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkClassComponent } from './trademark-class.component';

describe('TrademarkClassComponent', () => {
  let component: TrademarkClassComponent;
  let fixture: ComponentFixture<TrademarkClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkClassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
