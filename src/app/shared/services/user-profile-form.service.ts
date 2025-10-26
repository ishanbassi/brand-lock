import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { IUserProfile, NewUserProfile } from '../../../models/user-profile.model';
import { DATE_TIME_FORMAT } from '../../config/input.constants';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IUserProfile for edit and NewUserProfileFormGroupInput for create.
 */
type UserProfileFormGroupInput = IUserProfile | PartialWithRequiredKeyOf<NewUserProfile>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IUserProfile | NewUserProfile> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type UserProfileFormRawValue = FormValueOf<IUserProfile>;

type NewUserProfileFormRawValue = FormValueOf<NewUserProfile>;

type UserProfileFormDefaults = Pick<NewUserProfile, 'id' | 'createdDate' | 'modifiedDate' | 'deleted'>;

type UserProfileFormGroupContent = {
  id: FormControl<UserProfileFormRawValue['id'] | NewUserProfile['id']>;
  createdDate: FormControl<UserProfileFormRawValue['createdDate']>;
  modifiedDate: FormControl<UserProfileFormRawValue['modifiedDate']>;
  deleted: FormControl<UserProfileFormRawValue['deleted']>;
  firstName: FormControl<UserProfileFormRawValue['firstName']>;
  lastName: FormControl<UserProfileFormRawValue['lastName']>;
  active: FormControl<UserProfileFormRawValue['active']>;
  email: FormControl<UserProfileFormRawValue['email']>;
  phoneNumber: FormControl<UserProfileFormRawValue['phoneNumber']>;
  addressLine1: FormControl<UserProfileFormRawValue['addressLine1']>;
  addressLine2: FormControl<UserProfileFormRawValue['addressLine2']>;
  city: FormControl<UserProfileFormRawValue['city']>;
  zipCode: FormControl<UserProfileFormRawValue['zipCode']>;
  state: FormControl<UserProfileFormRawValue['state']>;
  utmCampaign: FormControl<UserProfileFormRawValue['utmCampaign']>;
  utmSource: FormControl<UserProfileFormRawValue['utmSource']>;
  utmMedium: FormControl<UserProfileFormRawValue['utmMedium']>;
  utmContent: FormControl<UserProfileFormRawValue['utmContent']>;
  user: FormControl<UserProfileFormRawValue['user']>;
};

export type UserProfileFormGroup = FormGroup<UserProfileFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class UserProfileFormService {
  createUserProfileFormGroup(userProfile: UserProfileFormGroupInput = { id: null }): UserProfileFormGroup {
    const userProfileRawValue = this.convertUserProfileToUserProfileRawValue({
      ...this.getFormDefaults(),
      ...userProfile,
    });
    return new FormGroup<UserProfileFormGroupContent>({
         id: new FormControl(
        { value: userProfileRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      createdDate: new FormControl(userProfileRawValue.createdDate),
      modifiedDate: new FormControl(userProfileRawValue.modifiedDate),
      deleted: new FormControl(userProfileRawValue.deleted),
      firstName: new FormControl(userProfileRawValue.firstName, {
        validators: [Validators.required],
      }),
      lastName: new FormControl(userProfileRawValue.lastName, {
        validators: [Validators.required],
      }),
      active: new FormControl(userProfileRawValue.active),
      email: new FormControl(userProfileRawValue.email),
      phoneNumber: new FormControl(userProfileRawValue.phoneNumber),
      addressLine1: new FormControl(userProfileRawValue.addressLine1),
      addressLine2: new FormControl(userProfileRawValue.addressLine2),
      city: new FormControl(userProfileRawValue.city),
      zipCode: new FormControl(userProfileRawValue.zipCode),
      state: new FormControl(userProfileRawValue.state),
      utmCampaign: new FormControl(userProfileRawValue.utmCampaign),
      utmSource: new FormControl(userProfileRawValue.utmSource),
      utmMedium: new FormControl(userProfileRawValue.utmMedium),
      utmContent: new FormControl(userProfileRawValue.utmContent),
      user: new FormControl(userProfileRawValue.user),
    });
  }

  getUserProfile(form: UserProfileFormGroup): IUserProfile | NewUserProfile {
    return this.convertUserProfileRawValueToUserProfile(form.getRawValue() as UserProfileFormRawValue | NewUserProfileFormRawValue);
  }

  resetForm(form: UserProfileFormGroup, userProfile: UserProfileFormGroupInput): void {
    const userProfileRawValue = this.convertUserProfileToUserProfileRawValue({ ...this.getFormDefaults(), ...userProfile });
    form.reset(
      {
        ...userProfileRawValue,
        id: { value: userProfileRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): UserProfileFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
      deleted: false,
    };
  }

  private convertUserProfileRawValueToUserProfile(
    rawUserProfile: UserProfileFormRawValue | NewUserProfileFormRawValue,
  ): IUserProfile | NewUserProfile {
    return {
      ...rawUserProfile,
      createdDate: dayjs(rawUserProfile.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawUserProfile.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertUserProfileToUserProfileRawValue(
    userProfile: IUserProfile | (Partial<NewUserProfile> & UserProfileFormDefaults),
  ): UserProfileFormRawValue | PartialWithRequiredKeyOf<NewUserProfileFormRawValue> {
    return {
      ...userProfile,
      createdDate: userProfile.createdDate ? userProfile.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: userProfile.modifiedDate ? userProfile.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
