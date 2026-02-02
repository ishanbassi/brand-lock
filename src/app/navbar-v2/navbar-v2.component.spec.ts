import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarV2Component } from './navbar-v2.component';

describe('NavbarV2Component', () => {
  let component: NavbarV2Component;
  let fixture: ComponentFixture<NavbarV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarV2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
