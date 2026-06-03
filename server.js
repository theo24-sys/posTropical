
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Use the PORT environment variable provided by Render/Railway, or default to 3000 for local dev
const port = process.env.PORT || 3000;

// 1. Serve logo.png specifically from the ROOT directory (main dir)
// This handles the case where the user put the logo in the main folder instead of public
app.get('/logo.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'logo.png'));
});

// ═══════════════════════════════════════════════════════════════
// MIGRATION ENDPOINT: Trigger database sync from latest code
// ═══════════════════════════════════════════════════════════════
// This endpoint should be called after deploying code changes to sync
// menu pricing and inventory updates from constants.ts to Supabase.
// Example: curl -X POST http://localhost:3000/api/migrate
app.post('/api/migrate', async (req, res) => {
  try {
    console.log('🔄 Migration triggered: Syncing constants to database...');
    
    // IMPORTANT: To complete this migration:
    // 1. Uncomment the lines below when Supabase client is available in server context
    // 2. Or run the SQL UPDATE directly on Supabase:
    //
    //    UPDATE menu_items SET price = 200 WHERE id = 'sd_wat';
    //    UPDATE menu_items SET price = 150 WHERE id = 'sd_spark';
    //
    // 3. Or implement a seed script that imports constants.ts and syncs to DB
    
    res.json({
      success: true,
      message: 'Migration endpoint ready. See server.js for implementation instructions.',
      instructions: [
        'Update Supabase menu_items table directly with new pricing',
        'Or run: UPDATE menu_items SET price = 200 WHERE id = "sd_wat"',
        'Then restart server and refresh client to clear cache'
      ]
    });
  } catch (err) {
    console.error('Migration failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Serve static files from the 'dist' directory (Vite's default build output)
app.use(express.static(path.join(__dirname, 'dist')));

// 3. Handle client-side routing
// This ensures that deep links (e.g., /dashboard) return index.html so React can handle the route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
