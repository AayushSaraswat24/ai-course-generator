
import { genAI } from "@/lib/helper/gemini";

export async function courseGenerator(mainTopic: string, topics: string, userKnowledge: string) {
  try {
    const prompt = `
    You are an AI note generator. Stream high-quality educational notes topic by topic for the given main topic and subtopics.

   USER KNOWLEDGE LEVEL: ${userKnowledge}

    STRICT STREAMING FORMAT (VERY IMPORTANT):
    - First, for each topic, output exactly one JSON object with only the topic:
      {"topic":"<topic>"}
    - Then, stream the explanation in small chunks as multiple JSON objects, each containing ONLY "notes" with partial text (1–2 sentences or less):
      {"notes":"<partial text>"}
      {"notes":"<partial text>"}
      ...
    - After the topic is fully explained, move to the next topic and repeat.
    - DO NOT include markdown, code blocks, or arrays. DO NOT wrap outputs inside any container.
    - DO NOT include extra fields. Only "topic" or "notes" keys are allowed.
    - Each JSON object MUST end with a newline.

    STYLE:
    - Match the user's knowledge level.
    - Clear, concise language. Avoid verbosity and repetition.
    - No code; if absolutely needed, refer only to the final line in plain text (not formatted as code).

    MAIN TOPIC: ${mainTopic}
    SUBTOPICS (first main topic, then others): ${topics}

    EXAMPLE (format only, not content):
    {"topic":"ReactJS"}
    {"notes":"React is a JavaScript library for building UIs."}
    {"notes":"It promotes building apps using reusable components."}
    {"topic":"useState"}
    {"notes":"useState lets a function component hold state between renders."}
`;

    const result = await genAI.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result) {
        
          controller.enqueue(encoder.encode(chunk.text));
        }
        controller.close();
      },
    });

    return stream;
  } catch (error) {
    console.error("Error generating course notes:", JSON.stringify(error));
    throw new Error("Failed to generate notes . Internal Ai Error , try again later ");
  }
}
