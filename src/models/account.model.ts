export class Account {
  activated: boolean = false;
  authorities: string[] = new Array<string>();
  email?: string;
  firstName?: string | null;
  langKey?: string;
  lastName?: string | null;
  login?: string;
  imageUrl?: string | null;
  phoneNumber?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: number | null;
  password?: string | undefined;
  confirmPassword?: string | null;
  captchaResponse?: string | null;
  utmCampaign ?:string;
  utmSource?:string;
  utmMedium?: string;
  utmContent? :string;
  
  forRequest() {
    this.firstName = this.trimMe(this.firstName);
    this.lastName = this.trimMe(this.lastName);
    this.email = this.trimMe(this.email);
    this.phoneNumber = this.trimMe(this.phoneNumber);
    this.password = this.trimMe(this.password);
    this.confirmPassword = this.trimMe(this.confirmPassword);
    this.addressLine1 = this.trimMe(this.addressLine1);
    this.addressLine2 = this.trimMe(this.addressLine2);
    this.city = this.trimMe(this.city);
    this.state = this.trimMe(this.state);
    this.captchaResponse = this.trimMe(this.captchaResponse);
    this.utmCampaign = this.trimMe(this.utmCampaign);
    this.utmSource = this.trimMe(this.utmSource);
    this.utmMedium = this.trimMe(this.utmMedium);
    this.utmContent = this.trimMe(this.utmContent);
    

    return this;
  }

  trimMe(val?: string | null) {
    return val ? val.trim() : undefined;
  }
}
