import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTmNameSloganLogoClassComponent } from './add-tm-name-slogan-logo-class.component';

describe('AddTmNameSloganLogoClassComponent', () => {
  let component: AddTmNameSloganLogoClassComponent;
  let fixture: ComponentFixture<AddTmNameSloganLogoClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTmNameSloganLogoClassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTmNameSloganLogoClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
