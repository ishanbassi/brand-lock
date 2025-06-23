import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTrademarkComponent } from './add-trademark.component';

describe('AddTrademarkComponent', () => {
  let component: AddTrademarkComponent;
  let fixture: ComponentFixture<AddTrademarkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTrademarkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTrademarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
