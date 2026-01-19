import { db, serverTimestamp } from "../config/firebase.js";

const COLLECTION = "incidents";

const saveIncident = async ({ title, description, urgency, ai_summary }) => {
    const incident = {
        title,
        description,
        urgency,
        ai_summary,
        created_at: serverTimestamp(),
    };


    if (urgency.toLowerCase() === "alta") {
        incident.requires_supervisor = true;
        incident.server_timestamp = serverTimestamp();

    }

    const ref = await db.collection(COLLECTION).add(incident);

    return {
        id: ref.id,
        ...incident,
    };
};

const fetchIncidents = async () => {
    const snapshot = await db
        .collection(COLLECTION)
        .orderBy("created_at", "desc")
        .get();

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
};

export { saveIncident, fetchIncidents };
