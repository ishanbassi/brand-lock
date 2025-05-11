import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeafultTopSectionComponent } from './default-top-section.component';

describe('DeafultTopSectionComponent', () => {
  let component: DeafultTopSectionComponent;
  let fixture: ComponentFixture<DeafultTopSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeafultTopSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeafultTopSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
