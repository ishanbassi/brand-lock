import { Component, OnInit } from '@angular/core';
import { PricingSectionComponent } from '../pricing-section/pricing-section.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TmGovtFeesPopupComponent } from '../tm-govt-fees-popup/tm-govt-fees-popup.component';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../shared/services/payment.service';
import { ITrademark } from '../../models/trademark.model';
import { TrademarkService } from '../shared/services/trademark.service';
import { ITrademarkPlan, NewTrademarkPlan } from '../../models/trademark-plan.model';
import { SharedModule } from '../shared/shared.module';
import { TrademarkPlanService } from '../shared/trademark-plan.service';
import { filter, finalize, map, switchMap, tap } from 'rxjs';
import { LoadingService } from '../common/loading.service';
import { ToastrService } from 'ngx-toastr';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { IPayment } from '../../models/payment.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-trademark-plans-page',
  imports: [DashboardHeaderComponent,MatButtonModule,MatIcon,SharedModule],
  templateUrl: './trademark-plans-page.component.html',
  styleUrl: './trademark-plans-page.component.scss'
})
export class TrademarkPlansPageComponent implements OnInit {

  anonymousUser = true;
  trademark?: ITrademark | null;
  plans: ITrademarkPlan[] = [];
  payment?:IPayment| null;
  applicationId?:number;

  constructor(
    private readonly dialog:MatDialog,
    private readonly sessionStorageService: SessionStorageService,
    private readonly router: Router,
    private readonly paymentService: PaymentService,
    private readonly trademarkService:TrademarkService,
    private readonly trademarkPlanService:TrademarkPlanService ,
    private readonly toastService:ToastrService,
    private readonly loadingService:LoadingService,
    private readonly route: ActivatedRoute,

  ){}
  
  
  ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        this.applicationId = params['application'];
        if(!this.applicationId) {
          this.router.navigateByUrl("portal/dashboard");
          return;
        }
        this.anonymousUser = false;
        this.trademarkService.find(this.applicationId)
        .subscribe({
          next:(res) => {
          this.trademark =  res.body;
          },
          error: (err) => {
            this.anonymousUser = true;
            if(err.status == 404){
              this.toastService.error("The Requested application does not exists");
              return;
            }
            this.toastService.error(err.title);
            
          }
        })
        


      })
      
    
    
    this.trademarkPlanService.query().subscribe(res => {
      this.plans = res.body || [];
    });
    
    if(this.sessionStorageService.get("payment_id")){
      this.paymentService.find(this.sessionStorageService.get("payment_id"))
      .subscribe(res => this.payment = res.body)
    }

    

  }



  
  openGovtFeesPopup(fees:number) {
    this.dialog.open(TmGovtFeesPopupComponent, {data: {fees: fees}});  
  }

  navigate(planType:number) {

    this.sessionStorageService.set("selectedPlan",planType);
    if(this.anonymousUser){
      const isInitialOnboarding = this.sessionStorageService.get("initial-onboarding");
      if(!isInitialOnboarding){
       this.router.navigateByUrl("portal/trademark-registration/type")
        return
      }
      this.router.navigateByUrl("trademark-registration/step-1")
      return;
    }
    this.loadingService.show();
    this.trademark!.trademarkPlan = this.plans.find(plan => plan.fees === planType) || null; 
    this.trademarkService.partialUpdate(this.trademark!).pipe(
      switchMap((tm) => {
        if(this.payment){
          this.payment = this.updatePaymentDto(this.payment, tm.body);
          return this.paymentService.update(this.payment)
        }
         return this.paymentService.createPaymentFromTrademark(this.trademark!.id)
      }),
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (response) => {
        this.sessionStorageService.set("payment_id", response.body?.id);
        this.router.navigate(['trademark-registration/checkout'], { queryParams: { order_id: response.body?.orderId } });
        
      },
      error: (err) => {
        console.error('Error creating payment:', err);
      }
    });
}
  updatePaymentDto(payment: IPayment, tm: ITrademark | null) {
    if(!tm) return payment;
    const selectedPlan = this.plans.find(plan => plan.id === tm.trademarkPlan?.id )
    if(selectedPlan){
      payment.amount = selectedPlan.fees;
    }
    return payment;

  }

}
