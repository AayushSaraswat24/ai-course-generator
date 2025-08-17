
"use client";

type YTVideo = { title: string; video: { url: string; title: string; thumbnail: string } | null };

export default function VideoGrid({ videos }: { videos: YTVideo[] }) {
  const getEmbedUrl = (url: string) => {
    const longMatch = url.match(/v=([a-zA-Z0-9_-]+)/);
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    const videoId = longMatch?.[1] || shortMatch?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">🎬 Suggested Videos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((v, i) => {
          const url = v.video?.url;
          const embed = url ? getEmbedUrl(url) : null;
          return (
            <div
              key={i}
              className="rounded-lg border shadow-sm p-2 bg-white dark:bg-neutral-900"
            >
              <div className="text-sm font-medium mb-2 line-clamp-2">{v.title}</div>
              {embed ? (
                <div className="relative w-full h-[200px]">
                  <iframe
                    src={embed}
                    width="100%"
                    height="200"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`YouTube video: ${v.video?.title || v.title}`}
                    className="rounded w-full h-full"
                  />
                </div>
              ) : (
                <div className="text-red-500 text-sm">⚠️ Video not available</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
