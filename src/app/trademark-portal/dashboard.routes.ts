import { Routes } from "@angular/router";
import { DashboardComponent } from "../dashboard/dashboard.component";
import { AddTrademarkTypeComponent } from "../onboarding/add-trademark-type/add-trademark-type.component";
import { AddTmNameSloganLogoClassComponent } from "../add-tm-name-slogan-logo-class/add-tm-name-slogan-logo-class.component";
import { TrademarkPlansPageComponent } from "../trademark-plans-page/trademark-plans-page.component";
import { CheckoutPageComponent } from "../checkout-page/checkout-page.component";

export const dashboardRoutes: Routes = [
    {
            path:"dashboard",
            component:DashboardComponent,
            title:"Thank You"
        },
        {
            path:"trademark-registration/type",
            component:AddTrademarkTypeComponent,
            title:"Thank You"
        },
        {
            path:"trademark-registration/details",
            component:AddTmNameSloganLogoClassComponent,
            title:"Thank You"
        },
        {
            path:"trademark-registration/select-plan",
            component:TrademarkPlansPageComponent,
            title:"Thank You"
        },
        {
            path:"trademark-registration/checkout",
            component:CheckoutPageComponent,
            title:"Thank You"
        },

    
]