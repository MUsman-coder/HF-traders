import React, { useState } from 'react';
import { Check } from 'lucide-react';
import PageShell from '../components/PageShell';
import BusinessPlanModal from '../components/BusinessPlanModal';
import Reveal from '../components/Reveal';

interface Plan {
  name: string;
  tagline: string;
  price: string;
  featured?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: 'Basic',
    tagline: 'For small scrap suppliers',
    price: 'Pay per pickup',
    features: [
      'Standard scrap purchasing',
      'On-demand collection scheduling',
      'Manual weighing & documentation',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    tagline: 'For medium-sized businesses',
    price: 'Custom monthly rate',
    featured: true,
    features: [
      'Priority scrap purchasing rates',
      'Scheduled recurring pickups',
      'Dedicated logistics coordinator',
      'Digital weighing & reporting',
      'Priority phone & WhatsApp support',
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'For large industries',
    price: 'Contact for quote',
    features: [
      'Volume-based preferred pricing',
      'Full logistics & fleet support',
      'On-site inspection team',
      'Dedicated account manager',
      'Custom compliance reporting',
      '24/7 priority support line',
    ],
  },
];

const BusinessPlans: React.FC = () => {
  const [activePlan, setActivePlan] = useState<string | null>(null);

  return (
    <PageShell
      eyebrow="Business Plans"
      title="Packages built for every scale"
      subtitle="From single-yard suppliers to multi-site industrial operations, choose the partnership level that matches your volume."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PLANS.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 150} className="h-full">
            <div
              className={`rounded-2xl p-8 flex flex-col h-full border transition-all duration-300 hover:-translate-y-1.5 ${
                plan.featured
                  ? 'bg-gradient-to-b from-[#e8702a]/15 to-white/5 border-[#e8702a]/40 hover:shadow-[0_20px_50px_-15px_rgba(232,112,42,0.4)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'
              }`}
            >
              {plan.featured && (
                <span className="self-start mb-4 text-[10px] font-semibold uppercase tracking-wide text-[#e8702a] bg-[#e8702a]/15 px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-white text-2xl font-playfair italic">{plan.name}</h3>
              <p className="mt-1 text-white/55 text-sm">{plan.tagline}</p>
              <p className="mt-5 text-white text-lg font-semibold">{plan.price}</p>

              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check size={16} className="text-[#e8702a] mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setActivePlan(plan.name)}
                className={`mt-8 text-sm font-medium px-6 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-95 ${
                  plan.featured
                    ? 'bg-[#e8702a] hover:bg-[#d2611f] text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                }`}
              >
                Contact Us
              </button>
            </div>
          </Reveal>
        ))}
      </div>

      {activePlan && (
        <BusinessPlanModal planName={activePlan} onClose={() => setActivePlan(null)} />
      )}
    </PageShell>
  );
};

export default BusinessPlans;
