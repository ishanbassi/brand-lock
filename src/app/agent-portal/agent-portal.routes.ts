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
    // Application-number only. The old full form is kept for /portfolio/:id/edit, which is still
    // the right screen for correcting a mark the register has not answered for yet.
    path: 'portfolio/add',
    loadComponent: () => import('./agent-portfolio-add/agent-portfolio-add.component').then(m => m.AgentPortfolioAddComponent),
    title: 'Add Trademark | Agent Portal',
  },
  {
    // Target of the nightly watch digest email — the whole portfolio's conflicts on one screen.
    path: 'watch/conflicts',
    loadComponent: () => import('./agent-conflicts/agent-conflicts.component').then(m => m.AgentConflictsComponent),
    title: 'Portfolio Conflicts | Agent Portal',
  },
  {
    path: 'watch/journal',
    loadComponent: () => import('./agent-journal-watch/agent-journal-watch.component').then(m => m.AgentJournalWatchComponent),
    title: 'Trademark Watch | Agent Portal',
  },
  {
    // Rival firms an agent follows. Sits under watch/ with the other two: all three answer "what
    // is the register doing that affects me".
    path: 'watch/competitors',
    loadComponent: () => import('./agent-competitors/agent-competitors.component').then(m => m.AgentCompetitorsComponent),
    title: 'Competitors | Agent Portal',
  },
  {
    path: 'portfolio/claim',
    loadComponent: () => import('./agent-portfolio-claim/agent-portfolio-claim.component').then(m => m.AgentPortfolioClaimComponent),
    title: 'Find Your Trademarks | Agent Portal',
  },
  {
    path: 'portfolio/upload',
    loadComponent: () => import('./agent-portfolio-upload/agent-portfolio-upload.component').then(m => m.AgentPortfolioUploadComponent),
    title: 'Import Portfolio | Agent Portal',
  },
  {
    // Must stay below the literal 'portfolio/...' paths above, or 'add' / 'claim' / 'upload'
    // would each match :id and route to the detail screen instead.
    path: 'portfolio/:id',
    loadComponent: () =>
      import('./agent-trademark-detail/agent-trademark-detail.component').then(m => m.AgentTrademarkDetailComponent),
    title: 'Trademark | Agent Portal',
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
    path: 'reports/search',
    loadComponent: () => import('./agent-search-report/agent-search-report.component').then(m => m.AgentSearchReportComponent),
    title: 'Search Report | Agent Portal',
  },
  {
    path: 'deadlines',
    loadComponent: () => import('./agent-deadlines/agent-deadlines.component').then(m => m.AgentDeadlinesComponent),
    title: 'Deadlines | Agent Portal',
  },
  {
    path: 'documents',
    loadComponent: () => import('./agent-documents/agent-documents.component').then(m => m.AgentDocumentsComponent),
    title: 'Documents | Agent Portal',
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./agent-notifications/agent-notifications.component').then(m => m.AgentNotificationsComponent),
    title: 'Notifications | Agent Portal',
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
