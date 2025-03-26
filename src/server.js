import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import noteRoutes from "./routes/notes.routes.js";
import tagsRoutes from "./routes/tags.routes.js";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tags", tagsRoutes);


app.get("/", (req, res) => {
  res.send("🚀 API de Notas funcionando...");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`lml Servidor corriendo en http://localhost:${PORT}`);
});

