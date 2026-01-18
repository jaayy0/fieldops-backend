import express from "express";
import incidentsRoutes from "./routes/incidents.routes.js";

const app = express();

app.use(express.json());

app.use("/incidents", incidentsRoutes);

export default app;
