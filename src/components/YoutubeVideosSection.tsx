import { useSettings, parseYoutubeVideos, getYoutubeId } from "@/lib/settings";

export function YoutubeVideosSection() {
  const { settings, loading } = useSettings();
  if (loading) return null;

  const videos = parseYoutubeVideos(settings.youtube_videos)
    .filter((v) => v.enabled !== false)
    .map((v) => ({ ...v, ytId: getYoutubeId(v.url) }))
    .filter((v) => v.ytId);

  if (videos.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 pb-12">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-brand">Video tutorials</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Watch how to use Bypass Unlock step by step.
        </p>
      </div>
      <div className={`grid gap-5 ${videos.length === 1 ? "max-w-3xl mx-auto" : "md:grid-cols-2"}`}>
        {videos.map((v) => (
          <div key={v.id} className="rounded-lg overflow-hidden border border-border bg-card">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${v.ytId}`}
                title={v.title || "Bypass Unlock tutorial"}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            {v.title && <div className="p-3 text-sm font-medium">{v.title}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
