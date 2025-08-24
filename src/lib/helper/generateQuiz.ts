import { genAI } from "@/lib/helper/gemini";

export async function generateQuiz(topic:string,userKnowledge:string){
    try{
        const prompt = `
            your task is to check if prompt is appropriate if not then give valid cause ex: "violence" , "hate speech" , "sexual content " , "not related to education " etc .generate 10 high quality mcq based on difficulty:${userKnowledge} .your response example :
            {
            "prompt": {
            inappropriate:"false",
            cause:"educational",
            mainTopic:"AI",
            },
            questions:[
            {
            question:string,
            options:["string","string","string","string"],
            correctAnswer:number,
            explanation:"string max 25 words"
            }
            ]
            }
            Your entire response must be the JSON itself, with no markdown, comments, or explanations .
            prompt:${topic}
        `;

        const result = await genAI.models.generateContent({
        model:"gemini-2.5-flash-lite",
        contents: prompt,
        });

        if (!result || !result.text) {
        throw new Error("AI did not return any content.");
        }

        let raw = result.text.trim();

        if (raw.startsWith("```json")) {
        raw = raw.slice(7);
        }
        if (raw.endsWith("```")) {
        raw = raw.slice(0, -3);
        }

        return raw; 

    }catch(error:any){
        console.log(`Error in generate quiz: ${error}`);
        throw new Error("failed to generate quiz .");
    }
}