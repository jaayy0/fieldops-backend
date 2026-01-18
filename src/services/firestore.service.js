import { db } from "../config/firebase.js";

const COLLECTION = "incidents";

const saveIncident = async (incident) => {
    const ref = await db.collection(COLLECTION).add({
        ...incident,
        created_at: new Date(),
    });

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

export {
    saveIncident,
    fetchIncidents,
};
