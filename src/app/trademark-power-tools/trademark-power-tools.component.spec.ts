import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkPowerToolsComponent } from './trademark-power-tools.component';

describe('TrademarkPowerToolsComponent', () => {
  let component: TrademarkPowerToolsComponent;
  let fixture: ComponentFixture<TrademarkPowerToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkPowerToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkPowerToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
