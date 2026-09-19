import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();

    const topic = body.topic;
    const country = body.country || "India";
    const language = body.language || "English";

    if (!topic || !topic.trim()) {
      return Response.json(
        { error: "Please enter a topic or landing page." },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: [
        {
          role: "system",
          content:
            "You are an expert SEO keyword researcher. Generate useful, realistic keyword ideas for the user's topic. Do not invent search volume, CPC, or Google Trends data.",
        },
        {
          role: "user",
          content: `Research SEO keywords for:

Topic or landing page:
${topic}

Target country:
${country}

Language:
${language}

Generate 30 highly relevant keyword ideas.

For each keyword return:
- keyword
- intent: Informational, Commercial, Transactional, or Navigational
- opportunity: a score from 1 to 100 based only on SEO relevance and potential, not actual search volume

Return ONLY valid JSON in this exact structure:

{
  "keywords": [
    {
      "keyword": "example keyword",
      "intent": "Commercial",
      "opportunity": 85
    }
  ]
}`,
        },
      ],
    });

    const text = response.output_text;

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        {
          error: "The AI returned an invalid response.",
          raw: text,
        },
        { status: 500 }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          error?.message ||
          "Something went wrong while researching keywords.",
      },
      { status: 500 }
    );
  }
}