import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { FaqComponent } from './faq/faq.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TrademarkPortalComponent } from './trademark-portal/trademark-portal.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { LoginV2Component } from './login-v2/login-v2.component';
import { AuthGuard } from './guards/auth.guard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { CreateNewPassword } from './create-new-password/create-new-password.component';
import { FaqPageComponent } from './faq-page/faq-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
    
    {
        path:"",
        redirectTo:"create-account",
        pathMatch:"full"
    },

    {
        path:"home",
        component:HomeComponent,
        title:"Trademarx",
        canActivate: [AuthGuard],   
        data:{ roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path:"trademark",
        component:HomeComponent,
        title:"Trademarx",
        canActivate: [AuthGuard],       
        data:{ roles: ['ROLE_ANONYMOUS'] }
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
        component:FaqPageComponent,
        title:"FAQ"
    },
    {
        path: 'trademark-registration',
        component:OnboardingComponent,
        loadChildren: () => import('./onboarding/onboarding.routes').then(m => m.onboardingRoutes),
        title:"Trademark Registration",
    },
    {
        path: 'portal',
        component:TrademarkPortalComponent,
        loadChildren: () => import('./trademark-portal/dashboard.routes').then(m => m.dashboardRoutes),
        title:"Dashboard",
        canActivate: [AuthGuard],
        data:{ roles: ['ROLE_USER'] }
    },
    {
        path: 'create-account',
        component:CreateAccountComponent,
        title:"Create Account",
        canActivate: [AuthGuard],
        data:{ roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'instant-filing',
        component:CreateAccountComponent,
        title:"Instant Filing",
        canActivate: [AuthGuard],
        data:{ roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'tm-filing',
        component:CreateAccountComponent,
        title:"Trademark Filing",
        canActivate: [AuthGuard],
        data:{ roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'free-search',
        component:CreateAccountComponent,
        title:"Free Trademark Search",
        canActivate: [AuthGuard],
        data:{ roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'trademark-whatsapp-support',
        component:CreateAccountComponent,
        title:"Free Whatsapp Assistance",
        canActivate: [AuthGuard],
        data:{ roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'trademark-renewal',
        component:CreateAccountComponent,
        title:"Trademark Renewal",
        canActivate: [AuthGuard],
        data:{ roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'trademark-process',
        component:CreateAccountComponent,
        title:"Trademark Process",
        canActivate: [AuthGuard],
        data:{ roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'login',
        component:LoginV2Component,
        title:"Login",
        canActivate: [AuthGuard],
        data:{ roles: ['ROLE_ANONYMOUS'] }
    },
        {
        path: 'forgot-password',
        component:ForgotPasswordComponent,
        title:"Forgot Password",
        canActivate: [AuthGuard],
        data:{ roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'reset-password',
        component:CreateNewPassword,
        title:"Reset Password",
        canActivate: [AuthGuard],
        data:{ roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'not-found',
        component:PageNotFoundComponent,
        title:"404"
    },
    {
        path:"**",
        redirectTo:"not-found"
    }
];
