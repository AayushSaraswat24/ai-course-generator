import pdfParse from 'pdf-parse';

export async function extractText(buffer:Buffer):Promise<string>{
    const data=await pdfParse(buffer);
    return data.text.trim();
}

export function countWords(text:string):number{
    return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validateWordLimit(
    text:string,
    plan:'free' | 'pro' | 'enterprise',
):{ valid:boolean; wordCount:number; overLimitBy?:number}{
    const wordCount=countWords(text);
    const limit=plan==='free' ? 500 :2500;

    if(wordCount<=limit){
        return {valid:true,wordCount};
    }

    return {
        valid:false,
        wordCount,
        overLimitBy:wordCount-limit,
    }
}