import { genAI } from "@/lib/helper/gemini";

export async function courseGenerator(mainTopic:string,topics:string,userKnowledge:string){

const prompt = ` 
  your task is to create notes based on given topics . notes should be suitable to given user knowledge level . use simple , effective language without unnecessary repetation and avoid writing any kind of code if needed just write the main line only at the end of each topic .

your response example: 
{
  "heading": {
    "topic": "ReactJS",
    "notes": "string"
  },
  "subtopics": [
    {
      "topic": "string",
      "notes": "string"
    }
  ],
  ]
  
 Your entire response must be the JSON itself, with no markdown, comments, or explanations .

  mainTopic: "${mainTopic}",
  topics:${topics},
  user knowledge: "${userKnowledge}"
`;

  const result = await genAI.models.generateContent({
    model:"gemini-2.5-flash",
    contents: prompt,
  });
    return result.text;

}