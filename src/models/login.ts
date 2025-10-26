
export class Login {
  username: string | undefined;
  password: string | undefined;
  rememberMe:boolean = true

  isValidLoginRequest(form: any) {
    if (!this.username || this.username.trim() === '') {
      form.controls.username.setErrors({ invalid: true });
      return false;
    }
    if (!this.password || this.password.trim() === '') {
      form.controls.password.setErrors({ invalid: true });
      return false;
    }
    return true;
  }

  isValidForgotPasswordRequest(form: any) {
    if (!this.username || this.username.trim() === '') {
      form.controls.remail.setErrors({ invalid: true });
      return false;
    }
    return true;
  }

  forRequest() {
    this.username = this.trimMe(this.username);
    this.password = this.trimMe(this.password);
    return this;
  }

  trimMe(val?: string) {
    return val ? val.trim() : undefined;
  }
}
