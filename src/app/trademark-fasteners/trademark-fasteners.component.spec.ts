import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkFastenersComponent } from './trademark-fasteners.component';

describe('TrademarkFastenersComponent', () => {
  let component: TrademarkFastenersComponent;
  let fixture: ComponentFixture<TrademarkFastenersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkFastenersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkFastenersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
