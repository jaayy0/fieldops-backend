import {
    saveIncident,
    fetchIncidents,
} from "../services/firestore.service.js";

const createIncident = async (req, res) => {
    try {
        const { title, description, urgency } = req.body;

        if (!title || !description || !urgency) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const incident = {
            title,
            description,
            urgency,
        };

        const saved = await saveIncident(incident);

        res.status(201).json(saved);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getIncidents = async (_req, res) => {
    try {
        const incidents = await fetchIncidents();
        res.json(incidents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export {
    createIncident,
    getIncidents,
};
