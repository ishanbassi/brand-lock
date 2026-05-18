import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentTrademarksComponent } from './recent-trademarks.component';

describe('RecentTrademarksComponent', () => {
  let component: RecentTrademarksComponent;
  let fixture: ComponentFixture<RecentTrademarksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentTrademarksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentTrademarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
