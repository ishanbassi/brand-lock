import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-trademark-onboarding-btn-section',
  imports: [MatButton, MatIcon,SharedModule],
  templateUrl: './trademark-onboarding-btn-section.component.html',
  styleUrl: './trademark-onboarding-btn-section.component.scss'
})
export class TrademarkOnboardingBtnSectionComponent {
submit() {
  this.buttonClick.emit(true);
}

@Output()
buttonClick = new EventEmitter();

@Input()
isSubmitting= false;

@Input()
showSkipBtn = true;

@Input()
showNextBtn = true;


@Output()
skipEvent = new EventEmitter();

skip(){
  this.skipEvent.emit(true)
}


}
