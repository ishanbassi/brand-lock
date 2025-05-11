import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';

export const routes: Routes = [
    {
        path:"",
        component:HomeComponent,
        title:"Home"
    },
    {
        path:"home",
        component:HomeComponent,
        title:"Home"
    },
    {
        path:"privacy-policy",
        component:PrivacyPolicyComponent,
        title:"Privacy Policy"
    },
    {
        path:"terms-and-conditions",
        component:TermsConditionsComponent,
        title:"Terms & Conditions"
    },
    {
        path:"**",
        redirectTo:""
    }
];
