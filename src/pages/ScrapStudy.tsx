import React, { useState } from 'react';
import {
  Layers,
  GitCompareArrows,
  Fingerprint,
  Recycle,
  TrendingUp,
  DollarSign,
  Award,
  Leaf,
  Factory,
  ImageOff,
  ExternalLink,
} from 'lucide-react';
import PageShell from '../components/PageShell';
import Reveal from '../components/Reveal';

interface SourceLink {
  label: string;
  url: string;
}

interface Topic {
  slug: string;
  icon: typeof Layers;
  title: string;
  text: string;
  /** External stock-photo search pages to browse until a real photo is added. */
  sourceLinks: SourceLink[];
}

const TOPICS: Topic[] = [
  {
    slug: 'types-of-scrap',
    icon: Layers,
    title: 'Types of Scrap',
    text: 'An overview of ferrous, non-ferrous, and mixed industrial scrap categories.',
    sourceLinks: [
      { label: 'Pexels', url: 'https://www.pexels.com/search/scrap%20metal/' },
      { label: 'Pixabay', url: 'https://pixabay.com/images/search/scrap%20metal/' },
    ],
  },
  {
    slug: 'ferrous-vs-non-ferrous',
    icon: GitCompareArrows,
    title: 'Ferrous vs Non-Ferrous',
    text: 'Key differences in composition, magnetism, value, and common industrial use.',
    sourceLinks: [
      { label: 'Pexels', url: 'https://www.pexels.com/search/steel/' },
      { label: 'Pixabay', url: 'https://pixabay.com/images/search/steel/' },
    ],
  },
  {
    slug: 'metal-identification',
    icon: Fingerprint,
    title: 'Metal Identification',
    text: 'Visual and physical tests used to quickly identify metal type and purity.',
    sourceLinks: [{ label: 'Pexels', url: 'https://www.pexels.com/search/metal%20inspection/' }],
  },
  {
    slug: 'recycling-process',
    icon: Recycle,
    title: 'Recycling Process',
    text: 'How raw scrap is sorted, processed, melted, and reintroduced into manufacturing.',
    sourceLinks: [{ label: 'Pexels', url: 'https://www.pexels.com/search/recycling%20plant/' }],
  },
  {
    slug: 'market-trends',
    icon: TrendingUp,
    title: 'Market Trends',
    text: 'How global demand, energy costs, and industrial output shape scrap pricing.',
    sourceLinks: [{ label: 'Pexels', url: 'https://www.pexels.com/search/shipping%20containers/' }],
  },
  {
    slug: 'scrap-pricing-factors',
    icon: DollarSign,
    title: 'Scrap Pricing Factors',
    text: 'Grade, purity, market rate, and volume all play a role in final valuation.',
    sourceLinks: [{ label: 'Pexels', url: 'https://www.pexels.com/search/industrial%20scale/' }],
  },
  {
    slug: 'quality-grades',
    icon: Award,
    title: 'Quality Grades',
    text: 'Standard classifications used to sort scrap by purity and condition.',
    sourceLinks: [{ label: 'Pexels', url: 'https://www.pexels.com/search/metal%20sorting/' }],
  },
  {
    slug: 'sustainable-recycling',
    icon: Leaf,
    title: 'Sustainable Recycling',
    text: 'Why recycled metal reduces emissions and energy use compared to raw extraction.',
    sourceLinks: [{ label: 'Pexels', url: 'https://www.pexels.com/search/green%20factory/' }],
  },
  {
    slug: 'industrial-applications',
    icon: Factory,
    title: 'Industrial Applications',
    text: 'How recycled ferrous and non-ferrous metals feed back into construction and manufacturing.',
    sourceLinks: [{ label: 'Pexels', url: 'https://www.pexels.com/search/steel%20factory/' }],
  },
];

/**
 * Topic image with a graceful fallback when the file hasn't been added yet.
 * The fallback links out to stock-photo search pages so a real photo can be
 * found and swapped in later — click-through opens in a new tab.
 */
const TopicImage: React.FC<{ slug: string; alt: string; sourceLinks: SourceLink[] }> = ({
  slug,
  alt,
  sourceLinks,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="h-32 bg-gradient-to-br from-[#e8702a]/20 to-white/5 flex flex-col items-center justify-center gap-1.5 text-white/25 px-3">
        <ImageOff size={18} />
        <span className="text-[10px] font-medium uppercase tracking-wide text-center">{alt}</span>
        <div className="flex items-center gap-2 mt-0.5">
          {sourceLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] text-[#e8702a]/80 hover:text-[#e8702a] underline underline-offset-2 transition-colors"
            >
              {link.label}
              <ExternalLink size={9} />
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <img
      src={`/images/scrap-study/${slug}.jpg`}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
};

const ScrapStudy: React.FC = () => {
  return (
    <PageShell
      eyebrow="Scrap Study"
      title="Understanding the metal recycling lifecycle"
      subtitle="A closer look at how scrap is classified, valued, and recycled — from raw material to finished industrial input."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TOPICS.map(({ slug, icon: Icon, title, text, sourceLinks }, i) => (
          <Reveal key={title} delay={i * 150} className="h-full">
            <div
              role="link"
              tabIndex={0}
              onClick={() => window.open(sourceLinks[0]?.url, '_blank', 'noopener,noreferrer')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') window.open(sourceLinks[0]?.url, '_blank', 'noopener,noreferrer');
              }}
              className="group cursor-pointer bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-full hover:bg-white/[0.08] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="overflow-hidden">
                <TopicImage slug={slug} alt={title} sourceLinks={sourceLinks} />
              </div>
              <div className="p-6">
                <span className="w-11 h-11 -mt-14 relative rounded-xl bg-[#e8702a] flex items-center justify-center shadow-lg shadow-black/40">
                  <Icon size={20} className="text-white" />
                </span>
                <h3 className="mt-4 text-white text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-white/60 text-xs leading-relaxed">{text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
};

export default ScrapStudy;
