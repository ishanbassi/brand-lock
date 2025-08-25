import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { TrademarkService } from '../shared/services/trademark.service';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { ToastService } from '../shared/toast.service';
import { ITrademark } from '../../models/trademark.model';
import { TrademarkFormService } from '../shared/services/trademark-form.service';

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
    TrademarkOnboardingBtnSectionComponent,
    ReactiveFormsModule
  ],
  templateUrl: './trademark-select-class.component.html',
  styleUrl: './trademark-select-class.component.scss'
})
export class TrademarkSelectClassComponent implements OnInit {
  constructor(
    private readonly router:Router,
    private readonly trademarkService: TrademarkService,
    private readonly sessionStorageService: SessionStorageService,  
    private readonly toastService:ToastService,
    private readonly loadingService: LoadingService
  ){}
  filterChanges: Subject<boolean>|undefined;
  classificationChoice = "pick";
  isSubmitting: boolean = false;

  onClickValidation: boolean = false;
  trademark?:ITrademark|null;

  protected trademarkFormService = inject(TrademarkFormService);
  trademarkDetailsForm = this.trademarkFormService.createTrademarkFormGroup();


ngOnInit(): void {
  if(this.sessionStorageService.getObject('trademark')?.id){
          this.trademarkService.find(this.sessionStorageService.getObject('trademark').id).subscribe({
            next: (response) => {
              this.trademark = response.body; 
              if(this.trademark) {
                this.updateForm(this.trademark);
              }
            }
          })
        }
        else{
        this.router.navigate(['trademark-registration/step-3']);
        } 
    


}
protected updateForm(trademark:ITrademark): void {
    this.trademark = trademark;
    this.trademarkFormService.resetForm(this.trademarkDetailsForm, trademark);
  }


  skip(){}

  
  
}
