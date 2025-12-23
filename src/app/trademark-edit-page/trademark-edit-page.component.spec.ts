import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrademarkEditPageComponent } from './trademark-edit-page.component';

describe('TrademarkEditPageComponent', () => {
  let component: TrademarkEditPageComponent;
  let fixture: ComponentFixture<TrademarkEditPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrademarkEditPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrademarkEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
