import express from "express";
import {
    createIncident,
    getIncidents,
} from "../controllers/incidents.controller.js";

const router = express.Router();

router.post("/create-incident", createIncident);
router.get("/get-incidents", getIncidents);

export default router;
