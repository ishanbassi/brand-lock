import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkMachineToolsComponent } from './trademark-machine-tools.component';

describe('TrademarkMachineToolsComponent', () => {
  let component: TrademarkMachineToolsComponent;
  let fixture: ComponentFixture<TrademarkMachineToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkMachineToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkMachineToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
