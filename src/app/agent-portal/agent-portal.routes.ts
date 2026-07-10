import { Routes } from '@angular/router';

export const agentPortalRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent),
    title: 'Agent Dashboard | Trademarx',
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./agent-portfolio/agent-portfolio.component').then(m => m.AgentPortfolioComponent),
    title: 'My Portfolio | Agent Portal',
  },
  {
    path: 'portfolio/add',
    loadComponent: () => import('./agent-portfolio-form/agent-portfolio-form.component').then(m => m.AgentPortfolioFormComponent),
    title: 'Add Trademark | Agent Portal',
  },
  {
    path: 'portfolio/upload',
    loadComponent: () => import('./agent-portfolio-upload/agent-portfolio-upload.component').then(m => m.AgentPortfolioUploadComponent),
    title: 'Import Portfolio | Agent Portal',
  },
  {
    path: 'portfolio/:id/edit',
    loadComponent: () => import('./agent-portfolio-form/agent-portfolio-form.component').then(m => m.AgentPortfolioFormComponent),
    title: 'Edit Trademark | Agent Portal',
  },
  {
    path: 'portfolio/:id/watch',
    loadComponent: () => import('./agent-trademark-watch/agent-trademark-watch.component').then(m => m.AgentTrademarkWatchComponent),
    title: 'Trademark Watch | Agent Portal',
  },
  {
    path: 'profile',
    loadComponent: () => import('./agent-profile/agent-profile.component').then(m => m.AgentProfileComponent),
    title: 'My Profile | Agent Portal',
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

export const agentPublicRoutes: Routes = [
  {
    path: 'agent/:agentCode',
    loadComponent: () =>
      import('./agent-public-profile/agent-public-profile.component').then(
        m => m.AgentPublicProfileComponent
      ),
    title: 'Agent Profile | Trademarx',
  },
];
