import { genAI } from "@/lib/helper/gemini"; // your Gemini instance

export async function generateCoursePlan(rawTopic: string, userKnowledge: string,includeVideos:boolean){

  const prompt = `
your task is to check if prompt is appropriate and if not why? ex: "violence", "drugs", "sexual content", "hate speech","not related to education" ,etc give valid cause and keep the subtopics empty . extract the main topic, return sub-topic based on user knowledge level with keywords to search video if specified .your response example:
{
"prompt": {
inappropriate:"false",
cause:"educational"
},
"mainTopic": "string",
"subtopics": [
{
"title": "string",
"keyword": "string"
},
]
}
Your entire response must be the JSON itself, with no markdown, comments, or explanations .
  prompt: ${rawTopic} ,
  user knowledge: ${userKnowledge} ,
  include keyword: ${includeVideos} .
  `;

  const result = await genAI.models.generateContent({
    model:"gemini-2.5-flash",
    contents: prompt,
  });
  
   if (!result || !result.text) {
  throw new Error("AI did not return any content.");
}

let raw = result.text.trim();

// Remove markdown fence if present
if (raw.startsWith("```json")) {
  raw = raw.slice(7);
}
if (raw.endsWith("```")) {
  raw = raw.slice(0, -3);
}

return raw;
    
}

// work on prompt to return fixed structure in case of error and success both . keep the number of subtopic in control like max 10 .