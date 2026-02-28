import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCtaSectionComponent } from './search-cta-section.component';

describe('SearchCtaSectionComponent', () => {
  let component: SearchCtaSectionComponent;
  let fixture: ComponentFixture<SearchCtaSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCtaSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchCtaSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
