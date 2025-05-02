import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-validation-message',
  templateUrl: './validation-message.component.html',
  styleUrls: ['./validation-message.component.scss'],
  imports:[CommonModule],
  standalone:true
})
export class ValidationMessageComponent{  
  @Input() field: any;
  @Input() onClickValidation: boolean = false;
  @Input() customErrorMessage?: string;
  @Input() comparableField: any;
  @Input() customClass?: string;
  @Input() fieldErrorMessage?: string;

  @Input() customPatternMessage?: string;
  @Input() customMaskMessage?: string;
}
