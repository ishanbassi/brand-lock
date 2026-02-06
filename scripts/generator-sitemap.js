const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://trademarx.in';
const DIST_PATH = path.join(__dirname, '../dist/brand-lock/browser');

const urls = [];

export function walk(dir, urlPath = '') {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, `${urlPath}/${file}`);
    }

    if (file === 'index.html' && urlPath !== '') {
      urls.push(`${SITE_URL}${urlPath}`);
    }
  }
  return urls;
}

// walk(DIST_PATH);

// const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
// ${urls
//   .map(
//     url => `
//   <url>
//     <loc>${url}</loc>
//     <changefreq>weekly</changefreq>
//     <priority>${url.includes('/blogs/') ? '0.8' : '0.6'}</priority>
//   </url>`
//   )
//   .join('')}
// </urlset>`;

// fs.writeFileSync(
//   path.join(DIST_PATH, 'sitemap.xml'),
//   sitemap.trim()
// );

// console.log('✅ Sitemap generated:', `${SITE_URL}/sitemap.xml`);
