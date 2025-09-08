import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkPlansPageComponent } from './trademark-plans-page.component';

describe('TrademarkPlansPageComponent', () => {
  let component: TrademarkPlansPageComponent;
  let fixture: ComponentFixture<TrademarkPlansPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkPlansPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkPlansPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
