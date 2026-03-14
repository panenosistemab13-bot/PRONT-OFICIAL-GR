import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: any;

async function initDb() {
  try {
    const Database = (await import("better-sqlite3")).default;
    db = new Database("assinagr.db");
    
    // Test if database is corrupted by running a simple query
    db.pragma('integrity_check');
    console.log("Database connected successfully");
  } catch (error: any) {
    if (error.code === 'SQLITE_CORRUPT') {
      console.error("Database is corrupted, creating a new one...");
      try {
        const fs = await import("fs");
        fs.renameSync("assinagr.db", `assinagr.db.corrupt.${Date.now()}`);
        const Database = (await import("better-sqlite3")).default;
        db = new Database("assinagr.db");
        console.log("New database created successfully");
      } catch (e) {
        console.error("Failed to recreate database:", e);
      }
    } else {
      console.error("Failed to connect to database file, falling back to in-memory:", error);
      try {
        const Database = (await import("better-sqlite3")).default;
        db = new Database(":memory:");
        console.log("Using in-memory database as fallback");
      } catch (innerError) {
        console.error("Failed to initialize better-sqlite3 entirely:", innerError);
        // Mock DB for extreme fallback
        db = {
          exec: () => {},
          prepare: () => ({
            all: () => [],
            get: () => null,
            run: () => ({ changes: 0 })
          }),
          pragma: () => []
        };
      }
    }
  }

  // Initialize database
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS contracts (
        id TEXT PRIMARY KEY,
        data JSON NOT NULL,
        signature TEXT,
        signed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS maps (
        destination TEXT PRIMARY KEY,
        image_data TEXT NOT NULL
      )
    `);
  } catch (e) {
    console.error("Failed to initialize tables:", e);
  }

  try {
    db.exec(`ALTER TABLE contracts ADD COLUMN onbase_status BOOLEAN DEFAULT 0`);
  } catch (e) {
    // Column might already exist, ignore
  }
}

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/contracts", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM contracts ORDER BY created_at DESC");
      const contracts = stmt.all() as any[];
      res.json(contracts.map(c => ({
        ...c,
        data: JSON.parse(c.data),
        onbase_status: !!c.onbase_status
      })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  app.post("/api/contracts", (req, res) => {
    const { id, data } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO contracts (id, data) VALUES (?, ?)");
      stmt.run(id, JSON.stringify(data));
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create contract" });
    }
  });

  app.get("/api/contracts/:id", (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare("SELECT * FROM contracts WHERE id = ?");
      const contract = stmt.get(id) as any;
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json({
        ...contract,
        data: JSON.parse(contract.data),
        onbase_status: !!contract.onbase_status
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch contract" });
    }
  });

  app.post("/api/contracts/:id/sign", (req, res) => {
    const { id } = req.params;
    const { signature } = req.body;
    try {
      const stmt = db.prepare("UPDATE contracts SET signature = ?, signed_at = CURRENT_TIMESTAMP WHERE id = ?");
      const result = stmt.run(signature, id);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to sign contract" });
    }
  });

  app.post("/api/contracts/:id/onbase", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const stmt = db.prepare("UPDATE contracts SET onbase_status = ? WHERE id = ?");
      const result = stmt.run(status ? 1 : 0, id);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update onbase status" });
    }
  });

  app.delete("/api/contracts", (req, res) => {
    try {
      const stmt = db.prepare("DELETE FROM contracts");
      stmt.run();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to clear contracts" });
    }
  });

  app.delete("/api/contracts/:id", (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare("DELETE FROM contracts WHERE id = ?");
      const result = stmt.run(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete contract" });
    }
  });

  // Map Images API
  app.get("/api/maps", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM maps");
      const maps = stmt.all() as any[];
      res.json(maps);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch maps" });
    }
  });

  app.post("/api/maps", (req, res) => {
    const { destination, image_data } = req.body;
    try {
      const stmt = db.prepare("INSERT OR REPLACE INTO maps (destination, image_data) VALUES (?, ?)");
      stmt.run(destination, image_data);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save map" });
    }
  });

  app.delete("/api/maps/:destination", (req, res) => {
    const { destination } = req.params;
    try {
      const stmt = db.prepare("DELETE FROM maps WHERE destination = ?");
      const result = stmt.run(destination);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Map not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete map" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
