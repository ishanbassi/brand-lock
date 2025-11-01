
export class ResetPassword {
  newPassword: string | undefined;
  confirmPassword: string | undefined;
  key: string | undefined;

  isValidRequest(form: any) {
    if (!this.newPassword || this.newPassword.trim() === '') {
      form.controls.userPassword.setErrors({ invalid: true });
      return false;
    }
    if (!this.confirmPassword || this.confirmPassword.trim() === '') {
      form.controls.confirmPassword.setErrors({ invalid: true });
      return false;
    }
    if (this.newPassword && this.confirmPassword && this.newPassword.trim() !== this.confirmPassword.trim()) {
      form.controls.confirmPassword.setErrors({ invalid: true });
      return false;
    }
    return true;
  }

  forRequest() {
    this.newPassword = this.trimMe(this.newPassword);
    this.confirmPassword = this.trimMe(this.confirmPassword);
    this.key = this.trimMe(this.key);
    return this;
  }

  trimMe(val?: string) {
    return val ? val.trim() : undefined;
  }
}
