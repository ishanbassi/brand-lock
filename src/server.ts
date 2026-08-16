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
// @angular/ssr >= 19.2.20 validates the request Host against an allowlist to prevent SSRF. When it
// does not match it does NOT error — it silently falls back to client-side rendering and returns
// 200 with the empty app shell, which is how every route on this site served 0 words to crawlers.
// nginx terminates TLS and proxies here, so the real host arrives via X-Forwarded-*; without
// trustProxyHeaders those are ignored and the check fails on the internal host too.
// Equivalent env vars (no rebuild needed) are NG_ALLOWED_HOSTS and NG_TRUST_PROXY_HEADERS.
// NOTE: once this list is non-empty a non-matching Host is a hard 400, not a CSR fallback — so
// localhost/127.0.0.1 stay listed to keep `node dist/.../server.mjs` runs and any health check
// that hits the port directly from breaking. nginx sends `proxy_set_header Host $host`, and
// www.trademarx.in is 301'd to the apex before it ever reaches this process.
const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['trademarx.in', 'www.trademarx.in', 'localhost', '127.0.0.1'],
  trustProxyHeaders: true,
});
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
  { loc: `${SITE_URL}/trademark-filing-trends`, lastmod: TODAY },
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
  { loc: `${SITE_URL}/how-to-trademark`, lastmod: TODAY },
  ...guideSlugs('usecase').map(s => ({ loc: `${SITE_URL}/how-to-trademark/${s}`, lastmod: TODAY })),
  { loc: `${SITE_URL}/trademark-filing-trends`, lastmod: TODAY },
];

interface RawBlogEntry { slug: string; updatedAt: string; }
interface TrademarkSitemapEntry { slug: string; lastmod: string; }

app.get('/sitemap.xml', async (_req, res) => {
  try {
    const [blogResponse, tmResponse, trendsResponse] = await Promise.all([
      fetch(`https://cms.trademarx.in/api/blogs?fields[0]=slug&fields[1]=updatedAt`),
      fetch(`https://admin.trademarx.in/api/trademarks/sitemap?page=0&size=5000`),
      // Relative paths for every dimensional / periodic trends page (state, class, month, journal).
      fetch(`https://admin.trademarx.in/api/trademarks/trends/sitemap`).catch(() => null),
    ]);

    const blogJson: { data: RawBlogEntry[] } = await blogResponse.json();
    const tmEntries: TrademarkSitemapEntry[] = await tmResponse.json();
    const trendsPaths: string[] = trendsResponse && trendsResponse.ok ? await trendsResponse.json() : [];

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

    // Trends pages are live SSR queries recomputed on every render, so their lastmod is
    // genuinely today — unlike the hand-maintained TODAY constant used for static pages,
    // which had gone stale and was making every trends URL claim an old change date.
    const trendsLastmod = new Date().toISOString().slice(0, 10);
    const trendsUrls = trendsPaths.map(path => `
    <url>
      <loc>${SITE_URL}${path}</loc>
      <lastmod>${trendsLastmod}</lastmod>
    </url>`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrlEntries.join('')}
${trendsUrls.join('')}
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
// ─────────────────────────────────────────────────────────────────────────────
// Proprietor portfolio pages (/trademarks-by/:slug).
//
// These live in their own sitemap index rather than in /sitemap.xml: there is one URL per
// distinct applicant with 2+ public filings, which is far past the 50,000-URL cap a single
// urlset is allowed. The backend holds the qualifying slug list (cached, recomputed hourly)
// and hands out one shard per request.
// ─────────────────────────────────────────────────────────────────────────────

const COMPANY_SITEMAP_SHARD_SIZE = 45000;
const ADMIN_API = 'https://admin.trademarx.in/api/trademarks';

interface ProprietorSitemapShard {
  slugs: string[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

async function fetchProprietorShard(page: number): Promise<ProprietorSitemapShard> {
  const res = await fetch(`${ADMIN_API}/proprietors/sitemap?page=${page}&size=${COMPANY_SITEMAP_SHARD_SIZE}`);
  if (!res.ok) {
    throw new Error(`proprietor sitemap shard ${page} responded ${res.status}`);
  }
  return (await res.json()) as ProprietorSitemapShard;
}

/** Sitemap index listing the company shards. Referenced from robots.txt. */
app.get('/sitemap-companies.xml', async (_req, res) => {
  try {
    // Shard 0 doubles as the "how many shards are there" probe, so the index costs one call.
    const first = await fetchProprietorShard(0);
    const lastmod = new Date().toISOString().slice(0, 10);
    const shards = Array.from({ length: Math.max(1, first.totalPages) }, (_unused, i) => `
  <sitemap>
    <loc>${SITE_URL}/sitemap-companies-${i}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`);

    res.header('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${shards.join('')}
</sitemapindex>`);
  } catch (err) {
    console.error('❌ Company sitemap index error:', err);
    res.status(500).send('Sitemap error');
  }
});

app.get('/sitemap-companies-:shard.xml', async (req, res) => {
  const shard = Number(req.params['shard']);
  if (!Number.isInteger(shard) || shard < 0) {
    res.status(404).send('Not found');
    return;
  }

  try {
    const { slugs } = await fetchProprietorShard(shard);
    if (!slugs.length) {
      res.status(404).send('Not found');
      return;
    }

    const lastmod = new Date().toISOString().slice(0, 10);
    const urls = slugs.map(slug => `
  <url>
    <loc>${SITE_URL}/trademarks-by/${encodeURIComponent(slug)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`);

    res.header('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`);
  } catch (err) {
    console.error(`❌ Company sitemap shard ${shard} error:`, err);
    res.status(500).send('Sitemap error');
  }
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`
User-agent: *
Allow: /

Sitemap: https://trademarx.in/sitemap.xml
Sitemap: https://trademarx.in/sitemap-companies.xml
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
  // Mutable context the app can write to during render (Angular exposes it via
  // REQUEST_CONTEXT; see SsrStatusService). Without it every route — including
  // /not-found — answered 200, so dead URLs read as soft 404s to crawlers.
  const ssrContext: { statusCode?: number } = {};

  angularApp
    .handle(req, ssrContext)
    .then((response) => {
      if (!response) {
        next();
        return undefined;
      }
      const status = ssrContext.statusCode;
      // Response.status is read-only, so re-wrap when the app asked for a different code.
      const finalResponse =
        status && status !== response.status ? new Response(response.body, { status, headers: response.headers }) : response;
      return writeResponseToNodeResponse(finalResponse, res);
    })
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
