import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const body = req.body || {};
    const ingredients = body.ingredients || "chicken, rice";

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
Create 3 simple recipes using: ${ingredients}

Return JSON only:
{
  "recipes": [
    {
      "name": "Recipe name",
      "ingredients": "list",
      "instructions": "steps"
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
      return res.status(200).json({
        recipes: [
          {
            name: "Fallback Recipe (AI format issue)",
            ingredients,
            instructions: text
          }
        ]
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("OPENAI ERROR:", error);

    return res.status(500).json({
      error: error.message
    });
  }
}
