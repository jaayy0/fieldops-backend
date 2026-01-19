import { saveIncident, fetchIncidents } from "../services/firestore.service.js";
import { analyzeIncidentWithAI } from "../services/ai.service.js";

export const createIncident = async (req, res) => {
    try {
        const { title, description, urgency } = req.body;


        if (!title || !description || !urgency) {
            return res.status(400).json({
                message: "title, description and urgency are required",
            });
        }

        const ai_summary = await analyzeIncidentWithAI(description);

        const incident = await saveIncident({
            title,
            description,
            urgency,
            ai_summary,
        });

        res.status(201).json(incident);
    } catch (error) {
        console.error("Error creating incident:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getIncidents = async (_req, res) => {
    try {
        const incidents = await fetchIncidents();
        res.json(incidents);
    } catch (error) {
        console.error("Error fetching incidents:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
