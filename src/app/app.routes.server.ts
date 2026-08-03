import { RenderMode, ServerRoute } from '@angular/ssr';
import { environment } from '../environments/environment';

export const serverRoutes: ServerRoute[] = [

  
  {
    path: 'blogs/:slug',
    renderMode: RenderMode.Server,
    

  },
  {
    path: 'trademarks/**',
    renderMode: RenderMode.Server,
  },

  {
    path: 'portal/**',
    renderMode: RenderMode.Client
  },
  {
    // Onboarding funnel depends on browser storage (resume flow) — no SEO value.
    path: 'trademark-registration/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'search',
    renderMode: RenderMode.Server
  },
  {
    // The 403 card branches on the signed-in role, which only exists in browser
    // storage — server-rendering it would emit the signed-out variant and then
    // trip a hydration mismatch when the real role resolves.
    path: '403',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
