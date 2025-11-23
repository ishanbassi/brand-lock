import { Routes } from "@angular/router";
import { DashboardComponent } from "../dashboard/dashboard.component";
import { AddTrademarkTypeComponent } from "../onboarding/add-trademark-type/add-trademark-type.component";
import { AddTmNameSloganLogoClassComponent } from "../add-tm-name-slogan-logo-class/add-tm-name-slogan-logo-class.component";
import { TrademarkPlansPageComponent } from "../trademark-plans-page/trademark-plans-page.component";
import { CheckoutPageComponent } from "../checkout-page/checkout-page.component";
import { UploadDocumentPageComponent } from "../upload-document-page/upload-document-page.component";

export const dashboardRoutes: Routes = [
    {
            path:"dashboard",
            component:DashboardComponent,
            title:"Dashboard"
        },
        {
            path:"trademark-registration/type",
            component:AddTrademarkTypeComponent,
            title:"Select Type | Trademark Filing"
        },
        {
            path:"trademark-registration/details",
            component:AddTmNameSloganLogoClassComponent,
            title:"Fill Details | Trademark Filing"
        },
        {
            path:"trademark-registration/select-plan",
            component:TrademarkPlansPageComponent,
            title:"Select Plan | Trademark Filing"
        },
        {
            path:"trademark-registration/checkout",
            component:CheckoutPageComponent,
            title:"Checkout | Trademark Filing"
        },
        {
            path:"upload-documents",
            component:UploadDocumentPageComponent,
            title:"Upload Documents | Trademark Filing"
        },

    
]