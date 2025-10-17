import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkPortalComponent } from './trademark-portal.component';

describe('TrademarkPortalComponent', () => {
  let component: TrademarkPortalComponent;
  let fixture: ComponentFixture<TrademarkPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkPortalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
