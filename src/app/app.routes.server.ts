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
    // The four portal shells are all guarded by AuthGuard, which reads the JWT from
    // localStorage. That does not exist on the server, so a server render always evaluates
    // the guard as signed-out and redirects to /login - the browser then paints the login
    // page, hydrates, re-runs the guard with the real token and bounces back. Rendering
    // these on the client skips that flash entirely. None of them have SEO value.
    path: 'portal/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'agent-portal/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin-portal/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'partner-portal/**',
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
