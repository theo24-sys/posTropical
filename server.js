
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Use the PORT environment variable provided by Render/Railway, or default to 3000 for local dev
const port = process.env.PORT || 3000;

// 1. Serve logo.png specifically from the ROOT directory (main dir)
// This handles the case where the user put the logo in the main folder instead of public
app.get('/logo.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'logo.png'));
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
