import { useSettings, getYoutubeId } from "@/lib/settings";

export function YoutubeVideosSection() {
  const { settings } = useSettings();
  
  // Parse YouTube videos from settings
  let videos: Array<{ id: string; title: string; url: string; enabled: boolean }> = [];
  try {
    if (settings.youtube_videos) {
      const parsed = JSON.parse(settings.youtube_videos);
      if (Array.isArray(parsed)) {
        videos = parsed.filter((v) => v && v.enabled && v.url);
      }
    }
  } catch {
    // Invalid JSON, show nothing
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="max-w-4xl mx-auto px-6 pb-16">
      <div className="border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-brand mb-4">Video Tutorials</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Watch these tutorials to learn how to use the Bypass Unlock tool and register your device.
        </p>
        
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => {
            const videoId = getYoutubeId(video.url);
            if (!videoId) return null;
            
            return (
              <div key={video.id} className="flex flex-col">
                <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="mt-3 font-medium text-sm">{video.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
