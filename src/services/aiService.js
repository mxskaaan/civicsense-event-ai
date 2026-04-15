export const processQuery = async (query, { gates, facilities }, apiKey) => {
  if (!apiKey) {
    return {
      text: "⚠️ Please enter a valid API key.",
      urgency: "high",
      action: "error"
    };
  }

  try {
    const prompt = `
You are a smart, dynamic stadium AI assistant.

Live Gate Data:
${gates.map(g => `${g.name}: ${g.crowdLevel}%`).join('\n')}

User Query:
${query}

Rules:
1. Direct Answer: Respond directly to the User Query.
2. Contextual Logic: If they ask why not a specific gate, explain based on its crowd level compared to the others. 
3. Best Gate: If they ask for suggestion, recommend the gate with the absolute lowest crowd level.
4. Keep answer short and conversational (1-2 sentences max).
5. Prioritize safety and crowd distribution.

Return strictly JSON:
{
"text": "Your conversational reply here",
"urgency": "low" | "medium" | "high",
"action": "navigate" | "safety" | "general"
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error("API failed");
    }

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      return JSON.parse(text);
    } catch {
      return {
        text: text || "Use the least crowded gate.",
        urgency: "low",
        action: "general"
      };
    }

  } catch (error) {
    console.error("Gemini Error:", error);

    // 🔥 IMPORTANT FALLBACK
    const bestGate = gates.reduce((min, g) =>
      g.crowdLevel < min.crowdLevel ? g : min
    );

    return {
      text: `Use ${bestGate.name} — lowest crowd (${bestGate.crowdLevel}%). Fastest entry.`,
      urgency: bestGate.crowdLevel > 80 ? "high" : "low",
      action: "navigate"
    };
  }
};