import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

(async () => {
  const server = await registerRoutes(app);

  // Error handling
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`Error ${status}: ${message}`);
    res.status(status).json({ message });
  });

  // Serve static files
  if (process.env.NODE_ENV === "development") {
    // In development, serve the client index.html for all non-API routes
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        res.status(404).json({ message: 'API endpoint not found' });
      } else {
        res.sendFile('client/index.html', { root: process.cwd() });
      }
    });
  } else {
    app.use(express.static("dist"));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: process.cwd() });
    });
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
})();