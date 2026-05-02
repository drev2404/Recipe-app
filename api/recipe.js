import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { ingredients, servings, time, diet, style } = req.body;

    const prompt = `
You are a professional chef AI.

Create 3 different recipes using ONLY these ingredients:
${ingredients}

Constraints:
- Servings: ${servings || "2"}
- Max cooking time: ${time || "30"} minutes
- Diet preference: ${diet || "none"}
- Cooking style: ${style || "any"}

Return STRICT JSON in this format:

{
  "recipes": [
    {
      "name": "Recipe name",
      "servings": "",
      "time": "",
      "diet": "",
      "style": "",
      "ingredients": "",
      "instructions": ""
    }
  ]
}

Rules:
- Always return 3 recipes
- Make them different from each other
- Keep instructions simple and practical
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const text = response.choices[0].message.content;

    res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate recipes" });
  }
}
