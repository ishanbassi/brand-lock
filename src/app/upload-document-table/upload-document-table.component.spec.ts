import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDocumentTableComponent } from './upload-document-table.component';

describe('UploadDocumentTableComponent', () => {
  let component: UploadDocumentTableComponent;
  let fixture: ComponentFixture<UploadDocumentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadDocumentTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadDocumentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
