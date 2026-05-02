import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST only" });
    }

    const { ingredients, servings, time, diet, style } = req.body || {};

    if (!ingredients) {
      return res.status(400).json({ error: "No ingredients provided" });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
Create 3 recipes using: ${ingredients}

Return ONLY valid JSON:
{
  "recipes": [
    {
      "name": "string",
      "servings": "${servings || 2}",
      "time": "${time || 30}",
      "diet": "${diet || "any"}",
      "style": "${style || "any"}",
      "ingredients": "string",
      "instructions": "string"
    }
  ]
}
`
        }
      ],
      temperature: 0.7,
    });

    const text = response.choices[0].message.content;

    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      // fallback so it NEVER crashes
      return res.status(200).json({
        recipes: [
          {
            name: "AI Response (format fix fallback)",
            servings: servings || "2",
            time: time || "30",
            diet: diet || "any",
            style: style || "any",
            ingredients: ingredients,
            instructions: text
          }
        ]
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
