import { genAI } from "@/lib/helper/gemini"; // your Gemini instance

export async function generateCoursePlan(rawTopic: string, userKnowledge: string,includeVideos:boolean){

  const prompt = `
    your task is to return a response based on the user prompt . check if prompt is appropriate and if not why .ex: "violence", "drugs", "sexual content", "hate speech",etc.extract the main topic,return the main sub-topic in array of object with keyword if specified to search educational video on youtube api.based on user knowledge .here is an example of user prompt "want to learn react js,level :moderate".your response example: 

    {
    "prompt": {
      inappropriate:"false",
      contain:"educational"
  },
    "mainTopic": "string",
    "isVast": true | false,
    "subtopics": [
      {
        "title": "string",
        "keyword": "string"
      },
      ...
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
    return result.text;
    
}
