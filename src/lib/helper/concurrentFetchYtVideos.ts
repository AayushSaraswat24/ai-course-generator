import pLimit from 'p-limit';
import {redis} from '../redis';
import {fetchYoutubeVideo} from './youtube';

interface SubtopicWithKeyword{
    title:string;
    keyword:string;
}

interface VideoObject{
    title: string;
    url: string;
    thumbnail: string;
}

interface VideoResult {
    title:string;
    video: VideoObject | null;
}

export async function concurrentFetchYoutubeVideos(subTopics:SubtopicWithKeyword[],concurrency=3):Promise<VideoResult[]>{
    const limit =pLimit(concurrency);

    const videoTasks=subTopics.map((item)=>
        limit(async ()=>{
            const cacheKey=`yt:${item.keyword.toLowerCase()}`;
            try{
                const cached=await redis.get(cacheKey);
                if(cached){
                    try {
                        if (typeof cached === "string") {

                        const video: VideoObject = JSON.parse(cached);
                        return { title: item.title, video };
                        } else if (typeof cached === "object") {

                        console.log(`Redis returned a parsed object for ${cacheKey}:`, cached);
                        return { title: item.title, video: cached as VideoObject };
                        } else {

                        console.log(`Unexpected Redis value type for ${cacheKey}:`, typeof cached);
                        await redis.del(cacheKey); 
                        }
                    } catch (err) {
                        console.log(`JSON.parse failed for ${cacheKey}:`, cached);
                        await redis.del(cacheKey); // corrupted value
                    }
                }

                const video =await fetchYoutubeVideo(item.keyword);

                if(video){
                    await redis.set(cacheKey,JSON.stringify(video),{ex:60*60*48})
                }else{
                    throw "yt helper is not working . may be limit is over"
                }

                return{
                    title:item.title,
                    video
                }
            }catch(error:any){
                // to handle redis error .
                console.log("Error in concurrent fetch yt video ",error);
                return {
                    title:item.title,
                    video:null 
                };
            }
        }))

        return await Promise.all(videoTasks);
}