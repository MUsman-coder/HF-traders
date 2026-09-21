import React from 'react';
import {
  ShoppingCart,
  Tag,
  SearchCheck,
  Award,
  ShieldAlert,
  Truck,
  Recycle,
  Leaf,
} from 'lucide-react';
import PageShell from '../components/PageShell';
import Reveal from '../components/Reveal';

const TOPICS = [
  { slug: 'buying-scrap', icon: ShoppingCart, title: 'Buying Scrap', text: 'How to evaluate suppliers, verify material grade, and negotiate fair bulk pricing before purchase.' },
  { slug: 'selling-scrap', icon: Tag, title: 'Selling Scrap', text: 'Preparing your material, understanding weight-based pricing, and getting the best rate for your scrap.' },
  { slug: 'scrap-inspection', icon: SearchCheck, title: 'Scrap Inspection', text: 'What our inspectors check for: contamination, mixed grades, moisture, and non-metallic content.' },
  { slug: 'quality-standards', icon: Award, title: 'Quality Standards', text: 'Grading benchmarks used across ferrous and non-ferrous categories to ensure consistent value.' },
  { slug: 'safety-procedures', icon: ShieldAlert, title: 'Safety Procedures', text: 'Handling guidelines for sharp, heavy, or hazardous scrap during loading and storage.' },
  { slug: 'transportation', icon: Truck, title: 'Transportation', text: 'Best practices for securing loads, weighing accuracy, and documentation during transit.' },
  { slug: 'recycling-process', icon: Recycle, title: 'Recycling Process', text: 'The journey from collection to sorting, processing, and final resale into the supply chain.' },
  { slug: 'environmental-compliance', icon: Leaf, title: 'Environmental Compliance', text: 'How we meet local regulations for waste handling, emissions, and responsible disposal.' },
];

const Guidance: React.FC = () => {
  return (
    <PageShell
      eyebrow="Guidance"
      title="Practical guidance for buyers & sellers"
      subtitle="Straightforward guidance on navigating the scrap trade, from your first sale to full compliance with recycling standards."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TOPICS.map(({ slug, icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 150} className="h-full">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-full hover:bg-white/[0.08] hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-32 overflow-hidden">
                <img
                  src={`/images/guidance/${slug}.jpg`}
                  alt={title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
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

export default Guidance;
