import { Routes } from "@angular/router";
import { AddTrademarkTypeComponent } from "./add-trademark-type/add-trademark-type.component";
import { BasicDetailsComponent } from "./basic-details/basic-details.component";
import { AddTmNameSloganLogoClassComponent } from "../add-tm-name-slogan-logo-class/add-tm-name-slogan-logo-class.component";
import { TrademarkSelectClassComponent } from "../trademark-select-class/trademark-select-class.component";
import { TrademarkPlansPageComponent } from "../trademark-plans-page/trademark-plans-page.component";
import { CheckoutPageComponent } from "../checkout-page/checkout-page.component";
import { TmBrandDetailsComponent } from "../tm-brand-details/tm-brand-details.component";
import { TmBusinessDetailsComponent } from "../tm-business-details/tm-business-details.component";
import { PaymentSuccessComponent } from "../payment-success/payment-success.component";

export const onboardingRoutes: Routes = [
    {
            path:"",
            redirectTo:"step-1",
            pathMatch: 'full'

        },
        {
            path:"step-1",
            component:BasicDetailsComponent,
            title:"Trademark Registration | Step 1"
        },
        {
            path:"step-2",
            component:AddTrademarkTypeComponent,
            title:"Trademark Registration | Step 2"
        },
        {
            path:"step-3",
            component:AddTmNameSloganLogoClassComponent,
            title:"Trademark Registration | Step 3"
        },
        {
            path:"select-class",
            component:TrademarkSelectClassComponent,
            title:"Trademark Registration | Select Class"
        },

        {
            path:"brand-details",
            component:TmBrandDetailsComponent,
            title:"Trademark Registration | Brand Details"
        },
        {
            path:"business-details",
            component:TmBusinessDetailsComponent,
            title:"Trademark Registration | Business & Documents"
        },
        {
            path:"select-plan",
            component:TrademarkPlansPageComponent,
            title:"Trademark Registration | Select Plan"
        },
        {
            path:"checkout",
            component:CheckoutPageComponent,
            title:"Trademark Registration | Pay"
        },
        {
            path:"payment-success",
            component:PaymentSuccessComponent,
            title:"Payment Successful | Trademarx"
        },
]