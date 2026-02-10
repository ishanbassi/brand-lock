import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { environment } from './environments/environment';
import { Blog } from './models/blog.model';
import path from 'path';
import fs from 'fs';
let staticUrls: string[] = []




const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const SITE_URL = 'https://trademarx.in';


export function walk(dir: string, urlPath = '') {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, `${urlPath}/${file}`);
    }

    if (file === 'index.html' && urlPath !== '') {
      staticUrls.push(`${SITE_URL}${urlPath}`);
    }
  }
}



/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.get('/sitemap.xml', async (req, res) => {
  try {
    const SITE_URL = 'https://trademarx.in';
    const response = (await fetch(`https://cms.trademarx.in/api/blogs?fields[0]=slug&fields[1]=updatedAt`));
    const json: Blog = await response.json();
    staticUrls = [];
    walk(browserDistFolder);

    const urls = json.data.map(blog => `
    <url>
      <loc>${SITE_URL}/blogs/${blog.slug}</loc>
      <lastmod>${blog.updatedAt}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>
  `);
    const staticUrlsList = staticUrls.map(url => `
      <url>
        <loc>${url}</loc>
        <changefreq>weekly</changefreq>
        <priority>${url.includes('/blogs/') ? '0.8' : '0.6'}</priority>
      </url>
    `);
    const urlString = urls.concat(staticUrlsList).join('');
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlString}
  </urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (err) {
    console.error('❌ Blog sitemap error:', err);
    res.status(500).send('Sitemap error');
  }

});
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`
User-agent: *
Allow: /

Sitemap: https://trademarx.in/sitemap.xml
`);
});



/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
