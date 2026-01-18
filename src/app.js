import express from "express";
import cors from "cors";
import incidentsRoutes from "./routes/incidents.routes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/incidents", incidentsRoutes);

export default app;
