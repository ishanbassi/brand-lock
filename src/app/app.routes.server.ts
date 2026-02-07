import { RenderMode, ServerRoute } from '@angular/ssr';
import { environment } from '../environments/environment';

export const serverRoutes: ServerRoute[] = [

  
  {
    path: 'blogs/:slug',
    renderMode: RenderMode.Server,
    

  },
  {
    path: 'portal/**',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
