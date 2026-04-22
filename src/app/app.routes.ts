import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import('./home-v2/home-v2.component').then(m => m.HomeV2Component),
        title: "Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: "home",
        loadComponent: () => import('./home-v2/home-v2.component').then(m => m.HomeV2Component),
        title: "Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: "trademark",
        loadComponent: () => import('./pages/trademark-page/trademark-page.component').then(m => m.TrademarkPageComponent),
        title: "Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: "privacy-policy",
        loadComponent: () => import('./privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
        title: "Privacy Policy"
    },
    {
        path: "terms-and-conditions",
        loadComponent: () => import('./terms-conditions/terms-conditions.component').then(m => m.TermsConditionsComponent),
        title: "Terms & Conditions"
    },
    {
        path: "about-us",
        loadComponent: () => import('./about-us/about-us.component').then(m => m.AboutUsComponent),
        title: "About Us"
    },
    {
        path: "thank-you",
        loadComponent: () => import('./thank-you/thank-you.component').then(m => m.ThankYouComponent),
        title: "Thank You"
    },
    {
        path: "faq",
        loadComponent: () => import('./faq-page/faq-page.component').then(m => m.FaqPageComponent),
        title: "FAQ"
    },
    {
        path: 'trademark-registration',
        loadComponent: () => import('./onboarding/onboarding.component').then(m => m.OnboardingComponent),
        loadChildren: () => import('./onboarding/onboarding.routes').then(m => m.onboardingRoutes),
        title: "Trademark Registration",
    },
    {
        path: 'portal',
        loadComponent: () => import('./trademark-portal/trademark-portal.component').then(m => m.TrademarkPortalComponent),
        loadChildren: () => import('./trademark-portal/dashboard.routes').then(m => m.dashboardRoutes),
        title: "Dashboard",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_USER'] }
    },
    {
        path: 'create-account',
        loadComponent: () => import('./create-account/create-account.component').then(m => m.CreateAccountComponent),
        title: "Create Account",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'instant-filing',
        loadComponent: () => import('./create-account/create-account.component').then(m => m.CreateAccountComponent),
        title: "Instant Filing",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'tm-filing',
        loadComponent: () => import('./create-account/create-account.component').then(m => m.CreateAccountComponent),
        title: "Trademark Filing",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'free-search',
        loadComponent: () => import('./create-account/create-account.component').then(m => m.CreateAccountComponent),
        title: "Free Trademark Search",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'trademark-whatsapp-support',
        loadComponent: () => import('./create-account/create-account.component').then(m => m.CreateAccountComponent),
        title: "Free Whatsapp Assistance",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'trademark-renewal',
        loadComponent: () => import('./create-account/create-account.component').then(m => m.CreateAccountComponent),
        title: "Trademark Renewal",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'trademark-process',
        loadComponent: () => import('./create-account/create-account.component').then(m => m.CreateAccountComponent),
        title: "Trademark Process",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'login',
        loadComponent: () => import('./login-v2/login-v2.component').then(m => m.LoginV2Component),
        title: "Login",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: "Forgot Password",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./create-new-password/create-new-password.component').then(m => m.CreateNewPassword),
        title: "Reset Password",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'not-found',
        loadComponent: () => import('./page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent),
        title: "404"
    },
    {
        path: 'blogs',
        loadComponent: () => import('./blog-list/blog-list.component').then(m => m.BlogListComponent),
    },
    {
        path: 'blogs/:slug',
        loadComponent: () => import('./blog-detail/blog-detail.component').then(m => m.BlogDetailComponent),
    },
    {
        path: "iso/iso-9001-2015",
        loadComponent: () => import('./iso-9001/iso-9001.component').then(m => m.Iso9001Component),
        title: "ISO 9001:2015 at Just ₹1,499",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: "search",
        loadComponent: () => import('./trademark-search/trademark-search.component').then(m => m.TrademarkSearchComponent),
        title: "Trademark Search In India| Check brand availability online",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: "trademarks/:url",
        loadComponent: () => import('./tradmark-detail/tradmark-detail.component').then(m => m.TradmarkDetailComponent),
        title: "Trademark Search In India| Check brand availability online",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },

    {
        path: "submit-otp",
        loadComponent: () => import('./submit-otp/submit-otp.component').then(m => m.SubmitOtpComponent),
        title: "Submit OTP",
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: "**",
        redirectTo: "not-found"
    }
];