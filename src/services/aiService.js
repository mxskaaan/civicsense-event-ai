import { GoogleGenerativeAI } from '@google/generative-ai';

export const processQuery = async (query, { gates, facilities }, apiKey) => {
  if (!apiKey) {
    return {
      text: "Config Error: Please provide a valid Gemini API Key to use dynamic contextual suggestions.",
      action: 'error',
      urgency: 'high'
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the context representing real-time venue state
    const gatesData = gates.map(g => `- ${g.name}: ${g.crowdLevel}% capacity (${g.status})`).join('\n');
    const facilitiesData = facilities.map(f => `- ${f.name} (${f.type}): ${f.crowdLevel}% capacity (${f.status})`).join('\n');

    const prompt = `You are the "CivicSense Event AI Assistant", guiding attendees efficiently and safely at a large-scale sporting venue. 
You have access to the following REAL-TIME venue data:

GATE STATUS:
${gatesData}

FACILITIES STATUS:
${facilitiesData}

USER QUERY: "${query}"

INSTRUCTIONS:
1. Answer the user's query dynamically and conversationally. Keep all text responses concise, actionable, and strictly 2-3 lines maximum.
2. If they ask about navigating or crowds, ALWAYS base your suggestion on the REAL-TIME venue data provided above, explicitly guiding them to the lowest congestion points.
3. If they ask for food or washroom, recommend the option with the lowest crowdLevel.
4. If they ask about a specific point that is highly crowded, proactively suggest a less crowded and shorter wait time alternative.
5. Prioritize user safety: If it's a safety emergency, classify urgency as 'high' and tell them to contact security at 555-0199 immediately.
6. Provide exactly a JSON response in the following format so the frontend can parse it:
{
  "text": "Your conversational reply here",
  "urgency": "low" | "medium" | "high",
  "action": "navigate" | "safety" | "general"
}

IMPORTANT: Do NOT output any markdown blocks like \`\`\`json. Output ONLY the raw JSON string.`;

    const result = await model.generateContent(prompt);
    let output = result.response.text().trim();
    
    // Clean markdown if present
    if (output.startsWith('```json')) {
       output = output.replace(/^```json\n?/, '');
       output = output.replace(/\n?```$/, '');
    } else if (output.startsWith('```')) {
       output = output.replace(/^```\n?/, '');
       output = output.replace(/\n?```$/, '');
    }
    
    try {
       const parsed = JSON.parse(output);
       return parsed;
    } catch (e) {
       console.error("Failed to parse Gemini output:", output);
       return {
         text: output,
         action: 'general',
         urgency: 'low'
       };
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Sorry, I am having trouble connecting to the generative AI model via the provided key.",
      action: 'error',
      urgency: 'high'
    };
  }
}
