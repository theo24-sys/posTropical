# 🔄 Database Migration Guide - Syncing Code Changes to Live Database

## Problem
When code changes are deployed to production (e.g., updating menu prices in `constants.ts`), these changes do **not** automatically propagate to the Supabase database. This is because the app is an offline-first PWA that reads from a persistent database, not from the code configuration.

## Solution: Three-Step Sync Process

### Step 1: Update IndexedDB Cache (✅ DONE)
- **File**: `services/db.ts`
- **Action**: Bumped `DB_VERSION` from 4 → 5
- **Effect**: Forces all connected clients to purge old cached data and reload fresh data from server on next page load

### Step 2: Enable Aggressive PWA Updates (✅ DONE)
- **File**: `vite.config.ts`
- **Action**: Added `skipWaiting: true` and `clientsClaim: true` to workbox configuration
- **Effect**: New service worker takes control immediately instead of waiting for all tabs to close

### Step 3: Sync Menu Items to Supabase Database (⚠️ REQUIRES MANUAL ACTION)

#### Option A: Run SQL Update Directly (Recommended for One-Off Changes)
Connect to your Supabase database and execute:

```sql
-- Update Keringet water price
UPDATE menu_items SET price = 200 WHERE id = 'sd_wat';

-- Verify the change
SELECT id, name, price FROM menu_items WHERE id = 'sd_wat';
```

#### Option B: Re-seed Entire Menu (For Multiple Changes)
1. Connect to Supabase via SQL Editor
2. Run `db_setup.sql` (or paste its contents)
3. This will DELETE and re-insert all menu items with latest prices

#### Option C: Use the Migration Endpoint (Requires Backend Setup)
Call the migration endpoint after deploying:

```bash
curl -X POST https://your-app.render.com/api/migrate
```

**Current Status**: Endpoint is ready in `server.js` but requires Supabase client setup in backend.

---

## Verification Steps

After completing any of the above steps:

1. **Clear Client Cache**:
   - Open DevTools → Application → Storage → Clear Site Data
   - Or hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

2. **Check Browser IndexedDB**:
   - DevTools → Application → IndexedDB → `tropical-pos-db`
   - Verify `menu_items` store has updated prices

3. **Test in Incognito/Private Window**:
   - Open the app in a fresh session (no cached data)
   - Navigate to menu and confirm new prices display

---

## Future Automation

To prevent manual steps, implement one of these:

### Recommended: Automated Sync on Server Startup
```javascript
// In server.js - uncomment when Supabase client is available
const syncMenuItems = async () => {
  const { data, error } = await supabase
    .from('menu_items')
    .upsert(MENU_ITEMS_FROM_CONSTANTS, { onConflict: 'id' });
  
  if (!error) console.log('✅ Menu items synced from code to database');
};
```

### Alternative: GitHub Actions CI/CD
Create `.github/workflows/sync-menu.yml` to automatically run `db_setup.sql` on deployment.

---

## Rollback Plan

If incorrect prices are pushed:

1. Correct the value in `constants.ts` and `db_setup.sql`
2. Run the SQL UPDATE again with correct values
3. Increment `DB_VERSION` again to force cache refresh
4. Redeploy

---

## Checklist for Menu Price Updates

- [ ] Update price in `constants.ts` (`MENU_ITEMS` array)
- [ ] Update price in `db_setup.sql`
- [ ] Update price in `moto.md` (documentation)
- [ ] Increment `DB_VERSION` in `services/db.ts`
- [ ] Run SQL UPDATE on Supabase
- [ ] Commit and push to GitHub
- [ ] Verify on live site

---

## Contact
For deployment issues, contact your DevOps/backend team to implement automated syncing.
