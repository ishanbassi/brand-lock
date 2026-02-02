import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkPageComponent } from './trademark-page.component';

describe('TrademarkPageComponent', () => {
  let component: TrademarkPageComponent;
  let fixture: ComponentFixture<TrademarkPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
