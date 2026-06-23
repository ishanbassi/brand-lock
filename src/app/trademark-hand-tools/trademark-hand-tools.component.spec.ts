import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkHandToolsComponent } from './trademark-hand-tools.component';

describe('TrademarkHandToolsComponent', () => {
  let component: TrademarkHandToolsComponent;
  let fixture: ComponentFixture<TrademarkHandToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkHandToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkHandToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
