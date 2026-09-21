import React from 'react';
import { Warehouse, Factory, PackageOpen, Truck, SearchCheck, Youtube, ExternalLink } from 'lucide-react';
import PageShell from '../components/PageShell';
import Reveal from '../components/Reveal';

interface TourStop {
  icon: typeof Warehouse;
  title: string;
  text: string;
  /** A direct YouTube video URL (watch?v=... or youtu.be/...) — embedded inline. */
  youtubeUrl?: string;
  /** A YouTube channel URL, used when there's no single video to embed —
   *  shown as a "Visit Channel" link instead of a player. */
  channelUrl?: string;
}

const TOUR_STOPS: TourStop[] = [
  {
    icon: Warehouse,
    title: 'Scrap Yard Tour',
    text: 'A walkthrough of our main yard where incoming material is received and sorted by category.',
    youtubeUrl: 'https://www.youtube.com/watch?v=HUZpil2CiLE',
  },
  {
    icon: Factory,
    title: 'Warehouse Tour',
    text: 'See how graded scrap is stored, stacked, and prepared for outbound shipment.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dDZCQp6Fk2E',
  },
  {
    icon: Truck,
    title: 'Recycling Plant',
    text: 'Inside our processing facility, including copper wire recovery from insulated cable.',
    youtubeUrl: 'https://www.youtube.com/watch?v=HSABGXjOu5s',
  },
  {
    icon: PackageOpen,
    title: 'Loading Area',
    text: 'How outbound loads are weighed, secured, and documented before transport.',
    youtubeUrl: 'https://www.youtube.com/watch?v=nHcJNT6lOQw',
  },
  {
    icon: SearchCheck,
    title: 'Material Processing',
    text: 'A closer look at sorting lines separating ferrous, non-ferrous, and mixed material.',
    youtubeUrl: 'https://www.youtube.com/watch?v=GRn7gNbMsLs',
  },
  {
    icon: Factory,
    title: 'Quality Inspection',
    text: 'Copper extraction and inspection process, straight from an electric motor recycling facility.',
    youtubeUrl: 'https://www.youtube.com/watch?v=GRn7gNbMsLs',
  },
];

/** Converts a normal YouTube watch/share URL into an embeddable URL. */
function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (parsed.pathname.startsWith('/embed/')) return url;
    }
    return null;
  } catch {
    return null;
  }
}

const LiveTour: React.FC = () => {
  return (
    <PageShell
      eyebrow="Live Tour"
      title="Take a look inside our operation"
      subtitle="A behind-the-scenes look at how HF Traders receives, inspects, processes, and ships scrap material — from yard to delivery."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TOUR_STOPS.map(({ icon: Icon, title, text, youtubeUrl, channelUrl }, i) => {
          const embedUrl = youtubeUrl ? toEmbedUrl(youtubeUrl) : null;

          return (
            <Reveal key={title} delay={i * 150} className="h-full">
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-full hover:bg-white/[0.08] hover:-translate-y-1 transition-all duration-300">
                {embedUrl ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={embedUrl}
                      title={title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : channelUrl ? (
                  <a
                    href={channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-video w-full bg-gradient-to-br from-[#e8702a]/20 to-white/5 flex flex-col items-center justify-center gap-2 text-white/60 hover:text-white transition-colors"
                  >
                    <ExternalLink size={24} />
                    <span className="text-xs font-medium">Visit YouTube Channel</span>
                  </a>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-br from-[#e8702a]/20 to-white/5 flex flex-col items-center justify-center gap-2 text-white/35">
                    <Youtube size={28} />
                    <span className="text-[11px]">Add a video link for this stop</span>
                  </div>
                )}
                <div className="p-6">
                  <span className="w-10 h-10 rounded-xl bg-[#e8702a]/15 flex items-center justify-center">
                    <Icon size={18} className="text-[#e8702a]" />
                  </span>
                  <h3 className="mt-4 text-white text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-white/60 text-xs leading-relaxed">{text}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </PageShell>
  );
};

export default LiveTour;
