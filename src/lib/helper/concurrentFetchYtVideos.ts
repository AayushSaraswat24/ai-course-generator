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
                    const video:VideoObject=JSON.parse(cached as string);
                    return {
                        title:item.title,
                        video
                    }
                }

                const video =await fetchYoutubeVideo(item.keyword);

                if(video){
                    await redis.set(cacheKey,JSON.stringify(video),{ex:60*60*48})
                }

                return{
                    title:item.title,
                    video
                }
            }catch(error:any){
                // to handle redis error .
                console.log(`Error in concurrent fetch yt video ${error}`);
                return {
                    title:item.title,
                    video:null 
                };
            }
        }))

        return await Promise.all(videoTasks);
}