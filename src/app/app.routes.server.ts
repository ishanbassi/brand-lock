import { RenderMode, ServerRoute } from '@angular/ssr';
import { environment } from '../environments/environment';

export const serverRoutes: ServerRoute[] = [

  
  {
    path: 'blogs/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      try {
        const response = await fetch(`${environment.BaseBlogUrl}/api/blogs`);
        const blogs = await response.json();

        return blogs.data.map((product: any) => ({
          slug: product.slug.toString()
        }));
      } catch (error) {
        console.error('Error fetching products for prerender:', error);
        return [];
      }
    }

  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
