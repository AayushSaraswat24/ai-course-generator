import {genAI} from "./gemini";

export async function pdfSummarizer(text:string){
    try{
        const prompt=`
        You are an advanced AI assistant. Your instructions are divided into two parts: a primary safety directive and a secondary summarization task.

        **Primary Directive: Safety First**
        Your first and most important task is to analyze the provided text for safety violations (e.g., hate speech, explicit violence, harassment).

        * **If the content is UNSAFE:** You must stop immediately. Your ONLY output should be a single, user-friendly sentence explaining the issue. For example: "This content cannot be summarized because it violates our safety guidelines."
        * **If the content is SAFE:** Do NOT mention the safety check in your response. Proceed silently to the summarization task below and produce ONLY the summary.

        **Summarization Task (Only if content is safe)**
        Analyze the document's structure and purpose to generate the most effective and user-friendly summary possible.

        1.  **Determine Optimal Format:** Based on the text, decide on the best format.
            * For a series of distinct points or findings, use a **bullet-point list**.
            * For a complex, interconnected argument, use a **concise paragraph**.
            * For a formal or business document, consider an **executive summary** format.
        2.  **Generate Summary:** Create a clean, well-written summary in the format you have determined to be most effective. Ensure the summary is comprehensive yet concise, and ignore any formatting errors from the PDF extraction.

        Here is the text:
            ${text}
        `;

        const result = await genAI.models.generateContentStream({
        model:"gemini-2.5-flash",
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