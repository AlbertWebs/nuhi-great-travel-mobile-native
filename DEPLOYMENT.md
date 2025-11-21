# Deployment Guide - Nuhi Luxury Travel

This guide will help you deploy the mobile booking app to **https://www.nuhiluxurytravel.com/** while keeping the API at **https://nuhigreattravels.com/api/v1**.

## Pre-Deployment Checklist

### ✅ Configuration Verified

1. **API URL**: Already configured correctly in `src/services/api.js`
   - Production API: `https://nuhigreattravels.com/api/v1`
   - This will remain unchanged

2. **Frontend Domain**: Will be deployed to `https://www.nuhiluxurytravel.com/`

3. **Build Configuration**: Optimized for production in `vite.config.js`

## Deployment Steps

### 1. Build the Application

```bash
# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

This will create an optimized production build in the `dist/` directory.

### 2. Verify Build Output

After building, check the `dist/` folder contains:
- `index.html`
- `assets/` folder with JS and CSS files
- `manifest.json`
- PWA icons (`pwa-192x192.png`, `pwa-512x512.png`)
- Service worker files (`sw.js`, `registerSW.js`)

### 3. Upload to Server

Upload all contents of the `dist/` folder to your web server at `https://www.nuhiluxurytravel.com/`

**Important**: Upload the contents of `dist/`, not the `dist` folder itself.

### 4. Server Configuration

Ensure your web server is configured correctly:

#### Apache (.htaccess)
Create or update `.htaccess` in the root directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

#### Nginx Configuration
Add to your Nginx config:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}

# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

### 5. CORS Configuration (Backend)

**IMPORTANT**: Ensure your Laravel backend at `https://nuhigreattravels.com` allows requests from the new frontend domain.

Update your Laravel `config/cors.php`:

```php
'allowed_origins' => [
    'https://www.nuhiluxurytravel.com',
    'https://nuhiluxurytravel.com',
],
```

Or in your `.env` file:
```
CORS_ALLOWED_ORIGINS=https://www.nuhiluxurytravel.com,https://nuhiluxurytravel.com
```

### 6. SSL Certificate

Ensure SSL is properly configured for `https://www.nuhiluxurytravel.com/` with a valid certificate.

### 7. Test the Deployment

After deployment, test the following:

1. ✅ App loads at `https://www.nuhiluxurytravel.com/`
2. ✅ API calls work (check browser console for API requests to `https://nuhigreattravels.com/api/v1`)
3. ✅ PWA installation works
4. ✅ All routes work (try navigating to different pages)
5. ✅ Service worker registers correctly
6. ✅ Images and assets load properly

## Environment Variables

The app uses the following environment variables (optional):

- `VITE_API_BASE_URL` - API base URL (defaults to `https://nuhigreattravels.com/api/v1`)

If you need to override the API URL, create a `.env.production` file:

```
VITE_API_BASE_URL=https://nuhigreattravels.com/api/v1
```

## Troubleshooting

### API Calls Failing

1. Check browser console for CORS errors
2. Verify backend CORS configuration includes the new frontend domain
3. Check network tab to see if requests are reaching the API

### Routes Not Working

1. Ensure server rewrite rules are configured (see Server Configuration above)
2. All routes should redirect to `index.html` for client-side routing

### PWA Not Installing

1. Check `manifest.json` is accessible
2. Verify service worker is registered (check Application tab in DevTools)
3. Ensure site is served over HTTPS

### Assets Not Loading

1. Check file paths are correct (should be relative paths)
2. Verify all files were uploaded from `dist/` folder
3. Check server MIME types are configured correctly

## Post-Deployment

1. Monitor error logs for any issues
2. Test on multiple devices and browsers
3. Verify Google Analytics (if configured) is tracking correctly
4. Check mobile responsiveness

## Rollback Plan

If issues occur, you can quickly rollback by:
1. Reverting to previous `dist/` folder backup
2. Or rebuilding from previous code version

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Status**: _______________

