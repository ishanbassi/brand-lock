import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { FaqComponent } from './faq/faq.component';

export const routes: Routes = [
    {
        path:"",
        component:HomeComponent,
        title:"Trademarx"
    },
    {
        path:"home",
        component:HomeComponent,
        title:"Trademarx"
    },
    {
        path:"trademark",
        component:HomeComponent,
        title:"Trademarx"
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
        path:"about-us",
        component:AboutUsComponent,
        title:"About Us"
    },
    {
        path:"thank-you",
        component:ThankYouComponent,
        title:"Thank You"
    },
    {
        path:"faq",
        component:FaqComponent,
        title:"FAQ"
    },
    {
        path:"**",
        redirectTo:""
    }
];
