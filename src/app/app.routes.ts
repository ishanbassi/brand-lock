import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import('./public-layout-component/public-layout-component.component').then(m => m.PublicLayoutComponentComponent),
        children:[
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
        path: "contact",
        loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent),
        title: "Contact Us | Trademarx"
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
        path: 'agent-portal',
        loadComponent: () => import('./agent-portal/agent-portal-shell.component').then(m => m.AgentPortalShellComponent),
        loadChildren: () => import('./agent-portal/agent-portal.routes').then(m => m.agentPortalRoutes),
        title: "Agent Portal",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_AGENT'] }
    },
    {
        path: 'create-agent-account',
        loadComponent: () => import('./create-agent-account/create-agent-account.component').then(m => m.CreateAgentAccountComponent),
        title: "Join as IP Agent | Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'agent/:agentCode',
        loadComponent: () => import('./agent-portal/agent-public-profile/agent-public-profile.component').then(m => m.AgentPublicProfileComponent),
        title: "Agent Profile | Trademarx",
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
        loadComponent: () => import('./trademark-renewal/trademark-renewal.component').then(m => m.TrademarkRenewalComponent),
        title: "Trademark Renewal — ₹4,999 | Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'trademark-objection-reply',
        loadComponent: () => import('./trademark-objection-reply/trademark-objection-reply.component').then(m => m.TrademarkObjectionReplyComponent),
        title: "Trademark Objection Reply — ₹2,999 | Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'trademark-watch',
        loadComponent: () => import('./trademark-watch/trademark-watch.component').then(m => m.TrademarkWatchComponent),
        title: "Trademark Watch Service — ₹1,499/year | Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'trademark-assignment',
        loadComponent: () => import('./trademark-assignment/trademark-assignment.component').then(m => m.TrademarkAssignmentComponent),
        title: "Trademark Assignment / Transfer — ₹4,999 | Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'trademark-opposition',
        loadComponent: () => import('./trademark-opposition/trademark-opposition.component').then(m => m.TrademarkOppositionComponent),
        title: "Trademark Opposition — ₹3,999 | Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'trademark-hearing',
        loadComponent: () => import('./trademark-hearing/trademark-hearing.component').then(m => m.TrademarkHearingComponent),
        title: "Trademark Hearing Assistance — ₹3,499 | Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: 'trademark-registration-for-auto-parts',
        loadComponent: () => import('./trademark-auto-parts/trademark-auto-parts.component').then(m => m.TrademarkAutoPartsComponent),
        title: "Trademark Registration for Auto Parts Manufacturers — ₹1,499 | Trademarx",
    },
    {
        path: 'trademark-registration-for-machine-tools',
        loadComponent: () => import('./trademark-machine-tools/trademark-machine-tools.component').then(m => m.TrademarkMachineToolsComponent),
        title: "Trademark Registration for Machine Tools Manufacturers — ₹1,499 | Trademarx",
    },
    {
        path: 'trademark-registration-for-bicycle-parts',
        loadComponent: () => import('./trademark-bicycle-parts/trademark-bicycle-parts.component').then(m => m.TrademarkBicyclePartsComponent),
        title: "Trademark Registration for Bicycle Parts Manufacturers — ₹1,499 | Trademarx",
    },
    {
        path: 'trademark-registration-for-fasteners',
        loadComponent: () => import('./trademark-fasteners/trademark-fasteners.component').then(m => m.TrademarkFastenersComponent),
        title: "Trademark Registration for Fasteners, Nuts & Bolts Manufacturers — ₹1,499 | Trademarx",
    },
    {
        path: 'trademark-registration-for-hand-tools',
        loadComponent: () => import('./trademark-hand-tools/trademark-hand-tools.component').then(m => m.TrademarkHandToolsComponent),
        title: "Trademark Registration for Hand Tools Manufacturers — ₹1,499 | Trademarx",
    },
    {
        path: 'trademark-registration-for-agricultural-equipment',
        loadComponent: () => import('./trademark-agricultural-equipment/trademark-agricultural-equipment.component').then(m => m.TrademarkAgriculturalEquipmentComponent),
        title: "Trademark Registration for Agricultural Equipment Manufacturers — ₹1,499 | Trademarx",
    },
    {
        path: 'trademark-registration-for-hosiery-knitwear',
        loadComponent: () => import('./trademark-hosiery-knitwear/trademark-hosiery-knitwear.component').then(m => m.TrademarkHosieryKnitwearComponent),
        title: "Trademark Registration for Hosiery & Knitwear Manufacturers — ₹1,499 | Trademarx",
    },
    {
        path: 'trademark-registration-for-sports-goods',
        loadComponent: () => import('./trademark-sports-goods/trademark-sports-goods.component').then(m => m.TrademarkSportsGoodsComponent),
        title: "Trademark Registration for Sports Goods Manufacturers — ₹1,499 | Trademarx",
    },
    {
        path: 'trademark-registration-for-steel-manufacturers',
        loadComponent: () => import('./trademark-steel-manufacturers/trademark-steel-manufacturers.component').then(m => m.TrademarkSteelManufacturersComponent),
        title: "Trademark Registration for Steel Manufacturers & Re-rolling Mills — ₹1,499 | Trademarx",
    },
    {
        path: 'trademark-registration-for-pump-manufacturers',
        loadComponent: () => import('./trademark-pump-manufacturers/trademark-pump-manufacturers.component').then(m => m.TrademarkPumpManufacturersComponent),
        title: "Trademark Registration for Pump Manufacturers — ₹1,499 | Trademarx",
    },
    {
        path: 'trademark-registration-for-forging-units',
        loadComponent: () => import('./trademark-forging-units/trademark-forging-units.component').then(m => m.TrademarkForgingUnitsComponent),
        title: "Trademark Registration for Forging Units — ₹1,499 | Trademarx",
    },
    {
        path: 'service-checkout',
        loadComponent: () => import('./service-checkout/service-checkout-page.component').then(m => m.ServiceCheckoutPageComponent),
        title: "Secure Checkout | Trademarx",
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
        path: "iso",
        loadComponent: () => import('./pages/iso-hub/iso-hub.component').then(m => m.IsoHubComponent),
        title: "ISO Certification in India — All Standards | Trademarx",
    },
    {
        path: "iso/iso-9001-2015",
        loadComponent: () => import('./iso-9001/iso-9001.component').then(m => m.Iso9001Component),
        title: "ISO 9001:2015 at Just ₹1,499",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: "iso/iso-14001",
        loadComponent: () => import('./iso-14001/iso-14001.component').then(m => m.Iso14001Component),
        title: "ISO 14001:2015 Environmental Certification — ₹1,999 | Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: "iso/iso-45001",
        loadComponent: () => import('./iso-45001/iso-45001.component').then(m => m.Iso45001Component),
        title: "ISO 45001:2018 OHS Certification — ₹1,999 | Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: "iso/iso-27001",
        loadComponent: () => import('./iso-27001/iso-27001.component').then(m => m.Iso27001Component),
        title: "ISO 27001:2022 Information Security Certification — ₹2,499 | Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: "iso/iso-22000",
        loadComponent: () => import('./iso-22000/iso-22000.component').then(m => m.Iso22000Component),
        title: "ISO 22000:2018 Food Safety Certification — ₹1,999 | Trademarx",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: "msme-registration",
        loadComponent: () => import('./pages/msme-registration/msme-registration.component').then(m => m.MsmeRegistrationComponent),
        title: "MSME / Udyam Registration — ₹499 | Trademarx",
    },
    {
        path: "iec-registration",
        loadComponent: () => import('./pages/iec-registration/iec-registration.component').then(m => m.IecRegistrationComponent),
        title: "IEC Registration — ₹1,499 | Trademarx",
    },
    {
        path: "trademark-classes",
        loadComponent: () => import('./pages/trademark-classes/trademark-classes.component').then(m => m.TrademarkClassesComponent),
        title: "Trademark Classes in India — All 45 Classes | Trademarx",
    },
    {
        path: "compare",
        loadComponent: () => import('./pages/compare-hub/compare-hub.component').then(m => m.CompareHubComponent),
        title: "IP & Legal Comparison Guides | Trademarx",
    },
    {
        path: "compare/:slug",
        loadComponent: () => import('./pages/comparison-page/comparison-page.component').then(m => m.ComparisonPageComponent),
    },
    {
        path: "trademark/industry/:industry",
        loadComponent: () => import('./pages/trademark-industry-page/trademark-industry-page.component').then(m => m.TrademarkIndustryPageComponent),
    },
    {
        path: "trademark/:city",
        loadComponent: () => import('./pages/trademark-city-page/trademark-city-page.component').then(m => m.TrademarkCityPageComponent),
    },
    {
        path: "msme-registration/:city",
        loadComponent: () => import('./pages/service-city-page/service-city-page.component').then(m => m.ServiceCityPageComponent),
        data: { serviceSlug: 'msme-registration' },
    },
    {
        path: "iec-registration/:city",
        loadComponent: () => import('./pages/service-city-page/service-city-page.component').then(m => m.ServiceCityPageComponent),
        data: { serviceSlug: 'iec-registration' },
    },
    {
        path: "iso/:city",
        loadComponent: () => import('./pages/service-city-page/service-city-page.component').then(m => m.ServiceCityPageComponent),
        data: { serviceSlug: 'iso-9001' },
    },
    {
        path: "search",
        loadComponent: () => import('./trademark-search/trademark-search.component').then(m => m.TrademarkSearchComponent),
        title: "Trademark Search In India| Check brand availability online",
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ANONYMOUS'] }
    },
    {
        path: "search/results",
        loadComponent: () => import('./trademark-search-result/trademark-search-result.component').then(m => m.TrademarkSearchResultComponent),
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
]
    }
]
