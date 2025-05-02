import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { ILead, NewLead } from './lead.model';
import { DATE_TIME_FORMAT } from '../config/input.constants';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ILead for edit and NewLeadFormGroupInput for create.
 */
type LeadFormGroupInput = ILead | PartialWithRequiredKeyOf<NewLead>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ILead | NewLead> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type LeadFormRawValue = FormValueOf<ILead>;

type NewLeadFormRawValue = FormValueOf<NewLead>;

type LeadFormDefaults = Pick<NewLead, 'id' | 'createdDate' | 'modifiedDate' | 'deleted'>;

type LeadFormGroupContent = {
  id: FormControl<LeadFormRawValue['id'] | NewLead['id']>;
  fullName: FormControl<LeadFormRawValue['fullName']>;
  phoneNumber: FormControl<LeadFormRawValue['phoneNumber']>;
  email: FormControl<LeadFormRawValue['email']>;
  city: FormControl<LeadFormRawValue['city']>;
  brandName: FormControl<LeadFormRawValue['brandName']>;
  selectedPackage: FormControl<LeadFormRawValue['selectedPackage']>;
  tmClass: FormControl<LeadFormRawValue['tmClass']>;
  comments: FormControl<LeadFormRawValue['comments']>;
  contactMethod: FormControl<LeadFormRawValue['contactMethod']>;
  createdDate: FormControl<LeadFormRawValue['createdDate']>;
  modifiedDate: FormControl<LeadFormRawValue['modifiedDate']>;
  deleted: FormControl<LeadFormRawValue['deleted']>;
  status: FormControl<LeadFormRawValue['status']>;
  leadSource: FormControl<LeadFormRawValue['leadSource']>;
  assignedTo: FormControl<LeadFormRawValue['assignedTo']>;
};

export type LeadFormGroup = FormGroup<LeadFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class LeadFormService {
  createLeadFormGroup(lead: LeadFormGroupInput = { id: null }): LeadFormGroup {
    const leadRawValue = this.convertLeadToLeadRawValue({
      ...this.getFormDefaults(),
      ...lead,
    });
    return new FormGroup<LeadFormGroupContent>({
      id: new FormControl(
        { value: leadRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      fullName: new FormControl(leadRawValue.fullName),
      phoneNumber: new FormControl(leadRawValue.phoneNumber),
      email: new FormControl(leadRawValue.email),
      city: new FormControl(leadRawValue.city),
      brandName: new FormControl(leadRawValue.brandName),
      selectedPackage: new FormControl(leadRawValue.selectedPackage),
      tmClass: new FormControl(leadRawValue.tmClass),
      comments: new FormControl(leadRawValue.comments),
      contactMethod: new FormControl(leadRawValue.contactMethod),
      createdDate: new FormControl(leadRawValue.createdDate),
      modifiedDate: new FormControl(leadRawValue.modifiedDate),
      deleted: new FormControl(leadRawValue.deleted),
      status: new FormControl(leadRawValue.status),
      leadSource: new FormControl(leadRawValue.leadSource),
      assignedTo: new FormControl(leadRawValue.assignedTo),
    });
  }

  getLead(form: LeadFormGroup): ILead | NewLead {
    return this.convertLeadRawValueToLead(form.getRawValue() as LeadFormRawValue | NewLeadFormRawValue);
  }

  resetForm(form: LeadFormGroup, lead: LeadFormGroupInput): void {
    const leadRawValue = this.convertLeadToLeadRawValue({ ...this.getFormDefaults(), ...lead });
    form.reset(
      {
        ...leadRawValue,
        id: { value: leadRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): LeadFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
      deleted: false,
    };
  }

  private convertLeadRawValueToLead(rawLead: LeadFormRawValue | NewLeadFormRawValue): ILead | NewLead {
    return {
      ...rawLead,
      createdDate: dayjs(rawLead.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawLead.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertLeadToLeadRawValue(
    lead: ILead | (Partial<NewLead> & LeadFormDefaults),
  ): LeadFormRawValue | PartialWithRequiredKeyOf<NewLeadFormRawValue> {
    return {
      ...lead,
      createdDate: lead.createdDate ? lead.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: lead.modifiedDate ? lead.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
