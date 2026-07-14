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
import path from 'path';
import fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware'; // option A
import * as https from 'https';
import * as http from 'http';
import { ALL_CITY_SLUGS } from './app/pages/trademark-city-page/city-data';
import { ALL_INDUSTRY_SLUGS } from './app/pages/trademark-industry-page/industry-data';
import { ALL_COMPARISON_SLUGS } from './app/pages/comparison-page/comparison-data';
import { guideSlugs } from './app/pages/guide-page/guide-sources';

let staticUrls: string[] = []




const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const __dirname = path.dirname(serverDistFolder);


const app = express();
const angularApp = new AngularNodeAppEngine();
const SITE_URL = 'https://trademarx.in';

// Security headers
const devOrigins = environment.production ? '' : ' http://localhost:8080 http://localhost:8082 http://localhost:4200';
app.use((_req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://kit.fontawesome.com https://www.google.com https://www.gstatic.com https://googleads.g.doubleclick.net https://admin.trademarx.in https://cms.trademarx.in https://checkout.razorpay.com https://cdn.razorpay.com ; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://ka-f.fontawesome.com data:; img-src 'self' data: https: blob:; connect-src 'self'${devOrigins} https://cms.trademarx.in https://admin.trademarx.in https://www.googletagmanager.com https://region1.google-analytics.com https://ka-f.fontawesome.com https://www.google-analytics.com https://analytics.google.com https://www.google.com https://www.googleadservices.com https://*.doubleclick.net https://api.razorpay.com https://checkout.razorpay.com https://lumberjack.razorpay.com ; frame-src https://www.google.com https://api.razorpay.com https://checkout.razorpay.com; object-src 'none'; base-uri 'self';`);
  next();
});

// Permanent redirect for previously indexed dead URL
app.get('/articles', (_req, res) => res.redirect(301, '/blogs'));


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

const TODAY = '2026-06-08';

const CORE_PAGES = [
  { loc: `${SITE_URL}/`,                   lastmod: TODAY },
  { loc: `${SITE_URL}/trademark`,          lastmod: TODAY },
  { loc: `${SITE_URL}/trademark-classes`,  lastmod: TODAY },
  { loc: `${SITE_URL}/msme-registration`,  lastmod: TODAY },
  { loc: `${SITE_URL}/iec-registration`,   lastmod: TODAY },
  { loc: `${SITE_URL}/iso`,               lastmod: TODAY },
  { loc: `${SITE_URL}/iso/iso-9001-2015`, lastmod: TODAY },
  { loc: `${SITE_URL}/search`,            lastmod: TODAY },
  { loc: `${SITE_URL}/about-us`,          lastmod: TODAY },
  { loc: `${SITE_URL}/blogs`,             lastmod: TODAY },
  { loc: `${SITE_URL}/contact`,           lastmod: TODAY },
  { loc: `${SITE_URL}/privacy-policy`,    lastmod: TODAY },
  { loc: `${SITE_URL}/terms-and-conditions`, lastmod: TODAY },
];

const STATIC_PAGES = [
  ...CORE_PAGES,
  ...ALL_CITY_SLUGS.map(s => ({ loc: `${SITE_URL}/trademark/${s}`,         lastmod: TODAY })),
  ...ALL_CITY_SLUGS.map(s => ({ loc: `${SITE_URL}/msme-registration/${s}`, lastmod: TODAY })),
  ...ALL_CITY_SLUGS.map(s => ({ loc: `${SITE_URL}/iec-registration/${s}`,  lastmod: TODAY })),
  ...ALL_CITY_SLUGS.map(s => ({ loc: `${SITE_URL}/iso/${s}`,               lastmod: TODAY })),
  ...ALL_INDUSTRY_SLUGS.map(s => ({ loc: `${SITE_URL}/trademark/industry/${s}`, lastmod: TODAY })),
  { loc: `${SITE_URL}/compare`, lastmod: TODAY },
  ...ALL_COMPARISON_SLUGS.map(s => ({ loc: `${SITE_URL}/compare/${s}`, lastmod: TODAY })),
  { loc: `${SITE_URL}/trademark-status`, lastmod: TODAY },
  ...guideSlugs('status').map(s => ({ loc: `${SITE_URL}/trademark-status/${s}`, lastmod: TODAY })),
  { loc: `${SITE_URL}/trademark-for`, lastmod: TODAY },
  ...guideSlugs('usecase').map(s => ({ loc: `${SITE_URL}/trademark-for/${s}`, lastmod: TODAY })),
];

interface RawBlogEntry { slug: string; updatedAt: string; }
interface TrademarkSitemapEntry { slug: string; lastmod: string; }

app.get('/sitemap.xml', async (_req, res) => {
  try {
    const [blogResponse, tmResponse] = await Promise.all([
      fetch(`https://cms.trademarx.in/api/blogs?fields[0]=slug&fields[1]=updatedAt`),
      fetch(`https://admin.trademarx.in/api/trademarks/sitemap?page=0&size=5000`),
    ]);

    const blogJson: { data: RawBlogEntry[] } = await blogResponse.json();
    const tmEntries: TrademarkSitemapEntry[] = await tmResponse.json();

    const blogUrls = blogJson.data.map(blog => `
    <url>
      <loc>${SITE_URL}/blogs/${blog.slug}</loc>
      <lastmod>${new Date(blog.updatedAt).toISOString().split('T')[0]}</lastmod>
    </url>`);

    const trademarkUrls = tmEntries.map(e => `
    <url>
      <loc>${SITE_URL}/trademarks/${e.slug}</loc>
      <lastmod>${e.lastmod}</lastmod>
    </url>`);

    const staticUrlEntries = STATIC_PAGES.map(p => `
    <url>
      <loc>${p.loc}</loc>
      <lastmod>${p.lastmod}</lastmod>
    </url>`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrlEntries.join('')}
${blogUrls.join('')}
${trademarkUrls.join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (err) {
    console.error('❌ Sitemap error:', err);
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
app.get('/og-image-proxy', (req, res) => {
  const imageUrl = req.query['src'] as string;
  if (!imageUrl) {
     res.status(400).send('Missing src parameter');
  }

  // Security: only allow your CMS subdomain
  const allowedHosts = [environment.BaseBlogUrl];
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
     res.status(400).send('Invalid URL');
     return;
  }
  console.log(allowedHosts, parsedUrl)
  if (!allowedHosts.some(host => host.includes(host))) {
     res.status(403).send('Forbidden host');
  }

  const protocol = parsedUrl.protocol === 'https:' ? https : http;

  protocol.get(imageUrl, (imageRes) => {
    // Forward content-type and cache headers
    res.setHeader('Content-Type', imageRes.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 1 day
    res.setHeader('Access-Control-Allow-Origin', '*');
    imageRes.pipe(res);
  }).on('error', () => {
    res.status(500).send('Failed to fetch image');
  });
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
