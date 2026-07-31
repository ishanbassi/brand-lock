import { Routes } from '@angular/router';

export const partnerPortalRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./partner-dashboard/partner-dashboard.component').then(m => m.PartnerDashboardComponent),
    title: 'Partner Dashboard | Trademarx',
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
