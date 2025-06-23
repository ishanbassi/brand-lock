import { Routes } from "@angular/router";
import { AddTrademarkTypeComponent } from "./add-trademark-type/add-trademark-type.component";
import { BasicDetailsComponent } from "./basic-details/basic-details.component";

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
]