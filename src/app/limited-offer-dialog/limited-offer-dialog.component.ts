import { Component, OnDestroy } from '@angular/core';
import { interval, map, Observable, shareReplay, Subject, takeUntil } from 'rxjs';
import { SharedModule } from '../shared/shared.module';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { DialogRef } from '@angular/cdk/dialog';
import { PhoneInputComponent } from '../phone-input/phone-input.component';

export interface TimeInterface{
  secondsToDday: number;
  minutesToDday: number;
  hoursToDday: number;
  daysToDday: number;
}

@Component({
  selector: 'app-limited-offer-dialog',
  imports: [SharedModule, ReactiveFormsModule ,MatInputModule,MatButton,MatIcon,MatDialogClose,MatDialogContent,PhoneInputComponent],
  templateUrl: './limited-offer-dialog.component.html',
  styleUrl: './limited-offer-dialog.component.scss'
})
export class LimitedOfferDialogComponent implements OnDestroy {
  onClickValidation: boolean = false;
  isSubmitting = false;
  public timeLeft$:Observable<TimeInterface>;
  private readonly destroy$ = new Subject<void>();



  limitedOfferForm = new FormGroup({
      phoneNumber: new FormControl('',[Validators.required]),
    })
  
  // 20 minutes from now
  private readonly endDay = new Date(Date.now() +  (20 * 60 * 1000) + (33 * 1000));

  constructor(
    private toastService:ToastrService,
    private dialogRef:DialogRef<LimitedOfferDialogComponent>
  ){
    this.timeLeft$ = interval(1000).pipe(
      map(x => this.calculateDiff()),
      takeUntil(this.destroy$),
      shareReplay(1)
    )
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  calculateDiff(): any {
     const dDay = this.endDay.valueOf();
    const milliSecondsInASecond = 1000;
    const hoursInADay = 24;
    const minutesInAnHour = 60;
    const secondsInAMinute = 60;

    const timeDifference = dDay - Date.now();

    const daysToDday = Math.floor(
      timeDifference /
        (milliSecondsInASecond * minutesInAnHour * secondsInAMinute * hoursInADay)
    );

    const hoursToDday = Math.floor(
      (timeDifference /
        (milliSecondsInASecond * minutesInAnHour * secondsInAMinute)) %
        hoursInADay
    );

    const minutesToDday = Math.floor(
      (timeDifference / (milliSecondsInASecond * minutesInAnHour)) %
        secondsInAMinute
    );

    const secondsToDday =
      Math.floor(timeDifference / milliSecondsInASecond) % secondsInAMinute;

    return { secondsToDday, minutesToDday, hoursToDday, daysToDday };

  }

  submitNetlifyForm(formGroup: FormGroup) {
    if (!formGroup.valid) {
      this.isSubmitting = false;
      return;
    }
    const form = formGroup.value;

    const formData = new FormData();
    formData.append('form-name', 'leads');
    formData.append('purpose', "Trademark Registration")
    formData.append('phoneNumber', form['phoneNumber'].number)

    fetch("/", {
      method: "POST",
      body: formData
    })
      .then((res) => {
        if (!res.ok) {
          this.toastService.error("There were some issues while submitting the detils. Please try later.");
          return;
        }
        this.toastService.success("Thank you for your submission! One of our team members will contact you soon.");
        console.log("Form successfully submitted");

      })
      .catch(error => alert(error))
      .finally(() => {
        this.isSubmitting=false;
        this.dialogRef.close();
      })
  }


    submit() {
      console.log(this.limitedOfferForm.value)
      this.onClickValidation = true;
      this.isSubmitting = true;
      this.submitNetlifyForm(this.limitedOfferForm);
    }
  
  


        
}
