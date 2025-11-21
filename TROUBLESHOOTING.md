# Troubleshooting Blank Page Issue

## Quick Checks

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console tab for errors:
- **404 errors** = Files not found (check file paths)
- **CORS errors** = Backend CORS not configured
- **MIME type errors** = Server not serving JS files correctly
- **Network errors** = Files not loading

### 2. Check Network Tab
In DevTools Network tab, check if these files load:
- `/assets/index-Bfz8W-ST.js` (main app)
- `/assets/react-vendor-Tc6NW7ob.js` (React)
- `/assets/index-DVfxrz2W.css` (styles)

If any show 404, the files weren't uploaded correctly.

### 3. Verify File Structure
On your server, ensure this structure exists:
```
/
├── index.html
├── .htaccess
├── assets/
│   ├── index-Bfz8W-ST.js
│   ├── react-vendor-Tc6NW7ob.js
│   ├── ui-vendor-B6cY4Oee.js
│   └── index-DVfxrz2W.css
├── manifest.json
├── manifest.webmanifest
├── registerSW.js
├── sw.js
├── workbox-*.js
└── pwa-*.png
```

## Common Issues & Solutions

### Issue 1: JavaScript Files Return 404

**Symptoms**: Console shows 404 errors for .js files

**Solutions**:
1. Verify all files from `dist/` folder were uploaded
2. Check file permissions (should be 644 for files, 755 for directories)
3. Ensure `.htaccess` is in the root directory
4. Check if mod_rewrite is enabled on Apache

### Issue 2: MIME Type Errors

**Symptoms**: Console shows "Failed to load module script" or MIME type errors

**Solutions**:
1. Ensure `.htaccess` is uploaded and active
2. Check Apache has `mod_mime` enabled
3. Verify server is serving `.js` files with `application/javascript` MIME type

### Issue 3: Service Worker Caching Blank Page

**Symptoms**: Page was blank before, now always shows blank even after fix

**Solutions**:
1. Clear browser cache and service workers:
   - Chrome: DevTools > Application > Storage > Clear site data
   - Or: Settings > Privacy > Clear browsing data > Cached images and files
2. Unregister service worker:
   - DevTools > Application > Service Workers > Unregister
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue 4: CORS Errors

**Symptoms**: Console shows CORS policy errors when calling API

**Solutions**:
1. Update Laravel backend CORS configuration:
   ```php
   'allowed_origins' => [
       'https://www.nuhiluxurytravel.com',
       'https://nuhiluxurytravel.com',
   ],
   ```
2. Clear Laravel config cache: `php artisan config:clear`

### Issue 5: .htaccess Not Working

**Symptoms**: Routes don't work, or files not loading

**Solutions**:
1. Verify `.htaccess` is in root directory (same level as `index.html`)
2. Check Apache has `mod_rewrite` enabled:
   ```bash
   # Check if mod_rewrite is enabled
   apache2ctl -M | grep rewrite
   ```
3. Ensure `.htaccess` files are allowed in Apache config:
   ```apache
   AllowOverride All
   ```

### Issue 6: Path Issues

**Symptoms**: Assets load from wrong path

**Solutions**:
1. Ensure you uploaded **contents** of `dist/` folder, not the `dist` folder itself
2. Files should be in root, not in a subdirectory
3. Check `index.html` has correct paths (should start with `/assets/`)

## Debugging Steps

### Step 1: Check if HTML loads
Visit `https://www.nuhiluxurytravel.com/` and view page source.
- ✅ If you see HTML with `<div id="root"></div>`, HTML is loading
- ❌ If you see nothing or server error, check server configuration

### Step 2: Check if JavaScript loads
In page source, look for:
```html
<script type="module" crossorigin src="/assets/index-Bfz8W-ST.js"></script>
```
Then try accessing that URL directly:
`https://www.nuhiluxurytravel.com/assets/index-Bfz8W-ST.js`
- ✅ If you see JavaScript code, file is accessible
- ❌ If 404, file wasn't uploaded or path is wrong

### Step 3: Check Console Errors
Open DevTools Console and look for:
- Red error messages
- Failed network requests
- JavaScript syntax errors

### Step 4: Check Network Tab
In DevTools Network tab:
1. Refresh page
2. Look for failed requests (red)
3. Check response codes (should be 200 for assets)
4. Verify Content-Type headers for JS files

## Quick Fix: Rebuild and Re-upload

If nothing works, try a clean rebuild:

```bash
# 1. Clean previous build
rm -rf dist

# 2. Rebuild
npm run build

# 3. Verify dist folder has all files
ls -la dist/

# 4. Upload everything from dist/ again
```

## Server-Specific Issues

### cPanel/Shared Hosting
- Ensure `.htaccess` is in public_html root
- Check if mod_rewrite is enabled (contact hosting support)
- Verify file permissions

### Nginx
If using Nginx instead of Apache, you need different config:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}

location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

## Still Not Working?

1. **Check server error logs** (usually in cPanel or `/var/log/apache2/error.log`)
2. **Test with a simple HTML file** to verify server is working
3. **Contact hosting support** if mod_rewrite or MIME types are issues
4. **Share browser console errors** for further debugging

