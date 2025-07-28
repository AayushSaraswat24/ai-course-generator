import axios from "axios";

export async function fetchYoutubeVideo(query:string){
     const start = Date.now();
    console.log(`⏱️ [${new Date().toISOString()}] Starting YT API call for "${query}"`);

    if(!query){
        console.log(`No query provided for YouTube search.`);
        return null;
    }

    const apiKey= process.env.YT_API_KEY!;

    if(!apiKey){
        console.log(`YouTube API key is not set in the environment variables.`);
        return null;
    }

    const url=`https://www.googleapis.com/youtube/v3/search`;
    try{

        const {data}=await axios.get(url,{
            params:{
                part:"snippet",
                type:"video",
                maxResults:1,
                q:query,
                key:apiKey,
            },
        });
        const item=data.items[0];
        const end = Date.now();
         console.log(`✅ [${new Date().toISOString()}] Completed YT API for "${query}" in ${end - start}ms`);
        if(!item){
            console.log(`No video found for query: ${query}`);
            return null;
        }
        
        return{
            title:item.snippet.title,
            url:`https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail:item.snippet.thumbnails?.default?.url||"",
        }
    }catch(error){
        console.log(`Error fetching YouTube video: ${error}`);
        return null;
    }
}