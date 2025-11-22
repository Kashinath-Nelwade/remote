// 

import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();

const __dirname = path.resolve();

// middleware
app.use(express.json());
// credentials:true meaning?? => server allows a browser to include cookies on request
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware()); // this adds auth field to request object: req.auth()

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../frontend/dist");

  // Serve static files first
  app.use(express.static(staticPath));

  // SPA fallback — using plain middleware (no path-to-regexp route)
  app.use((req, res, next) => {
    // only handle GET requests that accept HTML (browser navigation)
    if (req.method !== "GET") return next();
    const accept = req.headers.accept || "";
    if (!accept.includes("text/html")) return next();

    // send index.html for any browser navigation route
    return res.sendFile(path.join(staticPath, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}



const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();

