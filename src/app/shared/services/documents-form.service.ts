import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { IDocuments, NewDocuments } from '../../../models/documents.model';
import { DATE_TIME_FORMAT } from '../../config/input.constants';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDocuments for edit and NewDocumentsFormGroupInput for create.
 */
type DocumentsFormGroupInput = IDocuments | PartialWithRequiredKeyOf<NewDocuments>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IDocuments | NewDocuments> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type DocumentsFormRawValue = FormValueOf<IDocuments>;

type NewDocumentsFormRawValue = FormValueOf<NewDocuments>;

type DocumentsFormDefaults = Pick<NewDocuments, 'id' | 'createdDate' | 'modifiedDate' | 'deleted'>;

type DocumentsFormGroupContent = {
  id: FormControl<DocumentsFormRawValue['id'] | NewDocuments['id']>;
  documentType: FormControl<DocumentsFormRawValue['documentType']>;
  fileContentType: FormControl<DocumentsFormRawValue['fileContentType']>;
  fileName: FormControl<DocumentsFormRawValue['fileName']>;
  fileUrl: FormControl<DocumentsFormRawValue['fileUrl']>;
  createdDate: FormControl<DocumentsFormRawValue['createdDate']>;
  modifiedDate: FormControl<DocumentsFormRawValue['modifiedDate']>;
  deleted: FormControl<DocumentsFormRawValue['deleted']>;
  trademark: FormControl<DocumentsFormRawValue['trademark']>;
  file: FormControl<DocumentsFormRawValue['file']>;

};

export type DocumentsFormGroup = FormGroup<DocumentsFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DocumentsFormService {
  createDocumentsFormGroup(documents: DocumentsFormGroupInput = { id: null }): DocumentsFormGroup {
    const documentsRawValue = this.convertDocumentsToDocumentsRawValue({
      ...this.getFormDefaults(),
      ...documents,
    });
    return new FormGroup<DocumentsFormGroupContent>({
      id: new FormControl(
        { value: documentsRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      documentType: new FormControl(documentsRawValue.documentType),
      fileContentType: new FormControl(documentsRawValue.fileContentType),
      fileName: new FormControl(documentsRawValue.fileName),
      fileUrl: new FormControl(documentsRawValue.fileUrl),
      createdDate: new FormControl(documentsRawValue.createdDate),
      modifiedDate: new FormControl(documentsRawValue.modifiedDate),
      deleted: new FormControl(documentsRawValue.deleted),
      trademark: new FormControl(documentsRawValue.trademark),
      file : new FormControl(),

    });
  }

  getDocuments(form: DocumentsFormGroup): IDocuments | NewDocuments {
    return this.convertDocumentsRawValueToDocuments(form.getRawValue() as DocumentsFormRawValue | NewDocumentsFormRawValue);
  }

  resetForm(form: DocumentsFormGroup, documents: DocumentsFormGroupInput): void {
    const documentsRawValue = this.convertDocumentsToDocumentsRawValue({ ...this.getFormDefaults(), ...documents });
    form.reset(
      {
        ...documentsRawValue,
        id: { value: documentsRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): DocumentsFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
      deleted: false,
    };
  }

  private convertDocumentsRawValueToDocuments(rawDocuments: DocumentsFormRawValue | NewDocumentsFormRawValue): IDocuments | NewDocuments {
    return {
      ...rawDocuments,
      createdDate: dayjs(rawDocuments.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawDocuments.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertDocumentsToDocumentsRawValue(
    documents: IDocuments | (Partial<NewDocuments> & DocumentsFormDefaults),
  ): DocumentsFormRawValue | PartialWithRequiredKeyOf<NewDocumentsFormRawValue> {
    return {
      ...documents,
      createdDate: documents.createdDate ? documents.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: documents.modifiedDate ? documents.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }

  addValidationsToFormAndValidate(form: FormGroup<any>) {
        form.get('trademark')?.setValidators([Validators.required]);
        form.get('fileContentType')?.setValidators([Validators.required]);
        form.get('fileName')?.setValidators([Validators.required]);
        form.get('documentType')?.setValidators([Validators.required]);
        form.get('file')?.setValidators([Validators.required]);


    
      }
}
