import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Iso9001Component } from './iso-9001.component';

describe('Iso9001Component', () => {
  let component: Iso9001Component;
  let fixture: ComponentFixture<Iso9001Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Iso9001Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Iso9001Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
