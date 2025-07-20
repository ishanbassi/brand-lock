import { Routes } from "@angular/router";
import { AddTrademarkTypeComponent } from "./add-trademark-type/add-trademark-type.component";
import { BasicDetailsComponent } from "./basic-details/basic-details.component";
import { AddTmNameSloganLogoClassComponent } from "../add-tm-name-slogan-logo-class/add-tm-name-slogan-logo-class.component";
import { TrademarkSelectClassComponent } from "../trademark-select-class/trademark-select-class.component";

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
            path:"step-4",
            component:TrademarkSelectClassComponent,
            title:"Trademark Registration | Step 4"
        },
]