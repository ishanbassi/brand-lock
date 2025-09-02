import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TrademarkOnboardingBtnSectionComponent } from '../../trademark-onboarding-btn-section/trademark-onboarding-btn-section.component';
import { SharedModule } from '../../shared/shared.module';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrademarkType } from '../../enumerations/trademark-type.model';
import { TrademarkService } from '../../shared/services/trademark.service';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { ILead } from '../../../models/lead.model';
import { SessionStorageService } from '../../shared/services/session-storage.service';
import { ITrademark, NewTrademark } from '../../../models/trademark.model';
import { finalize, Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { LoadingService } from '../../common/loading.service';
import { TrademarkFormService } from '../../shared/services/trademark-form.service';

@Component({
  selector: 'app-add-trademark-type',
  imports: [MatIconModule,MatButton, TrademarkOnboardingBtnSectionComponent,SharedModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-trademark-type.component.html',
  styleUrl: './add-trademark-type.component.scss'
})
export class AddTrademarkTypeComponent implements OnInit{
  trademark?:ITrademark | null;
  trademarkType:keyof typeof TrademarkType = TrademarkType.TRADEMARK;
  lead?:ILead;
  isSubmitting = false;
  protected trademarkFormService = inject(TrademarkFormService);
  trademarkForm = this.trademarkFormService.createTrademarkFormGroup();
  constructor(
    private readonly router:Router,
    private readonly trademarkService: TrademarkService,
    private readonly localStorageService: LocalStorageService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly loadingService:LoadingService,
  ){}
  
  ngOnInit(): void {
    // defaults to Trademark type
    this.trademarkForm.controls['type'].setValue("TRADEMARK");
    this.lead = this.sessionStorageService.getObject('lead');
    if(!this.lead){
      this.router.navigate(['trademark-registration/step-1']);
      return
    }
    this.trademarkForm.patchValue({
      'lead':this.lead
    })
    const trademark =  this.sessionStorageService.getObject('trademark');
    if(trademark?.id){
      this.trademarkService.find(this.sessionStorageService.getObject('trademark').id)
      .subscribe(res => {
        this.trademark =  res.body;
        if(this.trademark){
          this.updateForm(this.trademark);
        } 
      })
    }
    
  }


  submit() {
    this.isSubmitting = true;
    const trademark = this.trademarkFormService.getTrademark(this.trademarkForm);
    if(trademark.id){
      this.subscribeToSaveResponse(this.trademarkService.partialUpdate(trademark))
    }else{
      this.subscribeToSaveResponse(this.trademarkService.create(trademark as NewTrademark))
    }
  }

  back() {
    this.router.navigate(['trademark-registration/step-1']);

  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITrademark>>): void {
      result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
        next: (trademark) => this.onSaveSuccess(trademark),
        error: () => this.onSaveError(),
      });
  }

  protected onSaveSuccess( trademark: HttpResponse<ITrademark>): void {
    this.sessionStorageService.setObject('trademark', trademark.body);
    this.router.navigateByUrl("trademark-registration/step-3")
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSubmitting = false;
    this.loadingService.hide();
  }

  protected   updateForm(trademark:ITrademark): void {
    this.trademarkFormService.resetForm(this.trademarkForm, trademark);

  }


}
