import { Component, OnInit } from '@angular/core';
import { PricingSectionComponent } from '../pricing-section/pricing-section.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TmGovtFeesPopupComponent } from '../tm-govt-fees-popup/tm-govt-fees-popup.component';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { Router } from '@angular/router';
import { PaymentService } from '../shared/services/payment.service';
import { ITrademark } from '../../models/trademark.model';
import { TrademarkService } from '../shared/services/trademark.service';
import { ITrademarkPlan, NewTrademarkPlan } from '../../models/trademark-plan.model';
import { SharedModule } from '../shared/shared.module';
import { TrademarkPlanService } from '../shared/trademark-plan.service';
import { finalize, switchMap } from 'rxjs';
import { LoadingService } from '../common/loading.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-trademark-plans-page',
  imports: [PricingSectionComponent,NavbarComponent,MatButtonModule,MatIcon,SharedModule],
  templateUrl: './trademark-plans-page.component.html',
  styleUrl: './trademark-plans-page.component.scss'
})
export class TrademarkPlansPageComponent implements OnInit {

  anonymousUser = true;
  trademark?: ITrademark | null;
  plans: ITrademarkPlan[] = [];

  constructor(
    private readonly dialog:MatDialog,
    private readonly sessionStorageService: SessionStorageService,
    private readonly router: Router,
    private readonly paymentService: PaymentService,
    private readonly trademarkService:TrademarkService,
    private readonly trademarkPlanService:TrademarkPlanService ,
    private readonly toastService:ToastrService,
    private readonly loadingService:LoadingService
  ){}
  
  
  ngOnInit(): void {
    const trademark = this.sessionStorageService.getObject('trademark');
    this.trademarkPlanService.query().subscribe(res => {
      this.plans = res.body || [];
    });
    if(trademark){
      this.anonymousUser = false;
      if(trademark.id){
        this.trademarkService.find(this.sessionStorageService.getObject('trademark').id)
      .subscribe(res => {
        this.trademark =  res.body;
      })
      }
    }
  }



  
  openGovtFeesPopup(fees:number) {
    this.dialog.open(TmGovtFeesPopupComponent, {data: {fees: fees}});  
  }

  navigate(planType:number) {

    this.sessionStorageService.set("selectedPlan",planType);
    if(this.anonymousUser){
      this.router.navigate(['/trademark-registration/step-1']);
      return;
    }
    this.loadingService.show();
    this.trademark!.trademarkPlan = this.plans.find(plan => plan.fees === planType) || null; 
    this.trademarkService.partialUpdate (this.trademark!).pipe(
      switchMap(() => this.paymentService.createPaymentFromTrademark(this.trademark!.id)),
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (response) => {
        this.router.navigate(['trademark-registration/checkout'], { queryParams: { order_id: response.orderId } });
        
      },
      error: (err) => {
        console.error('Error creating payment:', err);
      }
    });
}

}
