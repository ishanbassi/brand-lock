import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, switchMap, map, startWith } from 'rxjs/operators';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { SharedModule } from '../shared/shared.module';
import { DataService } from '../shared/services/data.service';
import { LoadingService } from '../common/loading.service';
import { TrademarkClassService } from '../shared/services/trademark-class.service';
import { TrademarkClassComponent } from '../shared/filters/trademark-class-filter/trademark-class.component';
import { ITrademarkClass } from '../../models/trademark-class.model';
import { TrademarkOnboardingBtnSectionComponent } from '../trademark-onboarding-btn-section/trademark-onboarding-btn-section.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trademark-select-class',
  standalone: true,
  imports: [
    FormsModule,
    MatRadioModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    SharedModule,
    TrademarkClassComponent,
    TrademarkOnboardingBtnSectionComponent
  ],
  templateUrl: './trademark-select-class.component.html',
  styleUrl: './trademark-select-class.component.scss'
})
export class TrademarkSelectClassComponent  {
submit() {
throw new Error('Method not implemented.');
}
filterChanges: Subject<boolean>|undefined;
classificationChoice = "pick";
isSubmitting: boolean = false;

onClassSelection($event: ITrademarkClass) {
  throw new Error('Method not implemented.');
}
constructor(
  private readonly router: Router,
){}

skip(){
        this.router.navigateByUrl("trademark-registration/step-2")
    }

  
}
