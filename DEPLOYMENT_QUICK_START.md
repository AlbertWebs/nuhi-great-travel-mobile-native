# Quick Deployment Guide

## Summary

- **Frontend URL**: https://www.nuhiluxurytravel.com/
- **API URL**: https://nuhigreattravels.com/api/v1 (unchanged)

## Quick Steps

1. **Build the app**:
   ```bash
   npm install
   npm run build
   ```

2. **Upload contents of `dist/` folder** to your web server root

3. **Copy `.htaccess` file** to the web server root (for Apache)

4. **Verify backend CORS** allows requests from `https://www.nuhiluxurytravel.com`

5. **Test**: Visit https://www.nuhiluxurytravel.com/ and verify API calls work

## Important Notes

✅ API URL is already configured correctly in `src/services/api.js`
✅ Build is optimized for production
✅ PWA manifest is configured
✅ All routes are client-side (React Router)

## Files to Upload

- All files from `dist/` folder
- `.htaccess` file (for Apache servers)

## Backend CORS Update Required

Update your Laravel backend to allow the new frontend domain:

```php
// config/cors.php or .env
'allowed_origins' => [
    'https://www.nuhiluxurytravel.com',
    'https://nuhiluxurytravel.com',
],
```

See `DEPLOYMENT.md` for detailed instructions.

