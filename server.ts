import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/contracts", async (req, res) => {
    try {
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(contracts.map(c => ({
        ...c,
        data: typeof c.dados === 'string' ? JSON.parse(c.dados) : c.dados,
        onbase_status: !!c.onbase_status
      })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  app.post("/api/contracts", async (req, res) => {
    const { id, data } = req.body;
    try {
      const { error } = await supabase
        .from('contracts')
        .insert([{ id, dados: data }]);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create contract" });
    }
  });

  app.get("/api/contracts/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const { data: contract, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }

      res.json({
        ...contract,
        data: typeof contract.dados === 'string' ? JSON.parse(contract.dados) : contract.dados,
        onbase_status: !!contract.onbase_status
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch contract" });
    }
  });

  app.post("/api/contracts/:id/sign", async (req, res) => {
    const { id } = req.params;
    const { signature } = req.body;
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          signature, 
          signed_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to sign contract" });
    }
  });

  app.post("/api/contracts/:id/onbase", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ onbase_status: status })
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update onbase status" });
    }
  });

  app.delete("/api/contracts", async (req, res) => {
    try {
      // Supabase requires a filter for deletes, so we delete where id is not null (all)
      const { error } = await supabase
        .from('contracts')
        .delete()
        .neq('id', '0');

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to clear contracts" });
    }
  });

  app.delete("/api/contracts/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete contract" });
    }
  });

  // Map Images API
  app.get("/api/maps", async (req, res) => {
    try {
      const { data: maps, error } = await supabase
        .from('maps')
        .select('*');

      if (error) throw error;
      res.json(maps);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch maps" });
    }
  });

  app.post("/api/maps", async (req, res) => {
    const { destination, image_data } = req.body;
    try {
      const { error } = await supabase
        .from('maps')
        .upsert([{ destination, image_data }]);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save map" });
    }
  });

  app.delete("/api/maps/:destination", async (req, res) => {
    const { destination } = req.params;
    try {
      const { error } = await supabase
        .from('maps')
        .delete()
        .eq('destination', destination);

      if (error) throw error;
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
