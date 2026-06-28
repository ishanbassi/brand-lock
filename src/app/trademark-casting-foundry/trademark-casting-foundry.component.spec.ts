import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkCastingFoundryComponent } from './trademark-casting-foundry.component';

describe('TrademarkCastingFoundryComponent', () => {
  let component: TrademarkCastingFoundryComponent;
  let fixture: ComponentFixture<TrademarkCastingFoundryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkCastingFoundryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkCastingFoundryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
