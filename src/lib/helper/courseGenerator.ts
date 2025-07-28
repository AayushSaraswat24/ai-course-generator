import { genAI } from "@/lib/helper/gemini";

export async function courseGenerator(mainTopic:string,topics:string,userKnowledge:string){
try{

const prompt = `
You are an AI note generator. Your task is to create high-quality educational notes based on the given main topic and subtopics.

Guidelines:
- Notes must match the user's knowledge level.
- Use clear, simple, and effective language.
- Avoid unnecessary repetition or verbose explanations.
- Do NOT include any code. If required, mention only the final line as plain text.
- For important subtopics, give detailed explanations. For others, keep it brief.

 Output Format:
- For every topic or subtopic, return a standalone JSON object:
  {"topic": "string", "notes": "string"}

- Stream each JSON object on a **new line**, one after another.
- DO NOT wrap everything in an array or object.
- DO NOT include markdown, comments, or explanations outside the JSON itself.
- Your response should only be a stream of JSON objects, one per line.

 Example output:
{"topic": "ReactJS", "notes": "React is a library..."}
{"topic": "props", "notes": "Props are used to..."}
{"topic": "useState", "notes": "useState allows you to..."}

 Main Topic: ${mainTopic},
 Subtopics: ${topics},
 User Knowledge: ${userKnowledge},
`;

  
  const result = await genAI.models.generateContentStream({
    model:"gemini-2.5-flash",
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
  
}

}

// testing prompt.