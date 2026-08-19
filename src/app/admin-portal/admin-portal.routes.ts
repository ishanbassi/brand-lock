import { Routes } from '@angular/router';

export const adminPortalRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    title: 'Admin Dashboard | Trademarx',
  },
  {
    path: 'leads',
    loadComponent: () => import('./leads/admin-leads.component').then(m => m.AdminLeadsComponent),
    title: 'Leads | Admin',
  },
  {
    path: 'leads/:id',
    loadComponent: () => import('./leads/admin-lead-detail.component').then(m => m.AdminLeadDetailComponent),
    title: 'Lead | Admin',
  },
  {
    path: 'trademarks',
    loadComponent: () => import('./trademarks/admin-trademarks.component').then(m => m.AdminTrademarksComponent),
    title: 'Applications | Admin',
  },
  {
    path: 'trademarks/:id',
    loadComponent: () => import('./trademarks/admin-trademark-detail.component').then(m => m.AdminTrademarkDetailComponent),
    title: 'Application | Admin',
  },
  {
    path: 'efiling',
    loadComponent: () => import('./efiling/admin-efiling.component').then(m => m.AdminEfilingComponent),
    title: 'E-filing Queue | Admin',
  },
  {
    path: 'efiling/:id',
    loadComponent: () => import('./efiling/admin-efiling-detail.component').then(m => m.AdminEfilingDetailComponent),
    title: 'File on IP India | Admin',
  },
  {
    path: 'documents',
    loadComponent: () => import('./documents/admin-documents.component').then(m => m.AdminDocumentsComponent),
    title: 'Document Review | Admin',
  },
  {
    path: 'payments',
    loadComponent: () => import('./payments/admin-payments.component').then(m => m.AdminPaymentsComponent),
    title: 'Payments | Admin',
  },
  {
    path: 'agents',
    loadComponent: () => import('./agents/admin-agents.component').then(m => m.AdminAgentsComponent),
    title: 'Agents | Admin',
  },
  {
    path: 'backlinks',
    loadComponent: () => import('./backlinks/admin-backlinks.component').then(m => m.AdminBacklinksComponent),
    title: 'Backlink Opportunities | Admin',
  },
  {
    path: 'api-consumers',
    loadComponent: () => import('./api-consumers/admin-api-consumers.component').then(m => m.AdminApiConsumersComponent),
    title: 'API Consumers | Admin',
  },
  {
    path: 'scraped-trademarks',
    loadComponent: () =>
      import('./scraped-trademarks/admin-scraped-trademarks.component').then(m => m.AdminScrapedTrademarksComponent),
    title: 'Scraped Trademarks | Admin',
  },
  {
    path: 'scraped-trademarks/:id',
    loadComponent: () =>
      import('./scraped-trademarks/admin-scraped-trademark-detail.component').then(m => m.AdminScrapedTrademarkDetailComponent),
    title: 'Scraped Trademark | Admin',
  },
  // Any unknown admin path falls back to the dashboard so sidebar links never 404.
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
