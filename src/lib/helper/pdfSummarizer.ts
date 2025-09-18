import {genAI} from "./gemini";

export async function pdfSummarizer(text:string){
    try{
        const prompt=`
You are an advanced AI assistant. Follow these instructions:

1. **Safety Check:** If the text contains unsafe content (e.g., hate speech, explicit violence, harassment), stop immediately and output only: "This content cannot be summarized because it violates safety guidelines." Otherwise, continue.

2. **Summarization:** Summarize the PDF so that someone can understand its main content and purpose quickly. Focus on:
   - The primary topic or story
   - Main sections, arguments, or events
   - Ignore exercises, questions, grammar lessons, or formatting details
   - Be detailed, clear, and readable
   - Use a paragraph if the PDF has one continuous narrative, or 3–5 bullet points if there are multiple main sections

3. Output only the summary.

        Here is the text:
            ${text}
        `;
        // something is wrong with 2.5 flash that's why using  Gemini 2.5 pro and flash lite can't handle this pdf summarization .
        const result = await genAI.models.generateContentStream({
        model:"gemini-2.5-pro",
        contents: prompt,
    });
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
        async start(controller) {
        for await (const chunk of result) {
            console.log("course generator output chunk:", JSON.stringify(chunk.text));
            controller.enqueue(encoder.encode(chunk.text));
        }
        controller.close();
        },
    });
    
    return stream;

    }catch(error:any){
        console.log(`Error in pdfSummarizer helper: ${error}`);
        throw new Error("failed to summarize the pdf .");
    }
}