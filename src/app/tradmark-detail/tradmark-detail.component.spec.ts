import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradmarkDetailComponent } from './tradmark-detail.component';

describe('TradmarkDetailComponent', () => {
  let component: TradmarkDetailComponent;
  let fixture: ComponentFixture<TradmarkDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradmarkDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradmarkDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
