import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeIncidentWithAI(description) {

    const prompt = `
  Analiza la siguiente descripción de incidencia y solo dame un pequeño resumen técnico en base a esta descripción

  Descripción:
  "${description}"
  `;

    const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
            { role: "system", content: "Respondeme en español y dame la descripción técnica de la incidencia" },
            { role: "user", content: prompt }
        ]
    });

    const resultText = response.choices[0].message.content;

    return resultText;
}

export { analyzeIncidentWithAI };
