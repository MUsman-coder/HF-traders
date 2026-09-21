import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  BadgeCheck,
  Users,
  Recycle,
  Factory,
  ClipboardList,
  Handshake,
  PackageSearch,
  Quote,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Award,
  DollarSign,
  Leaf,
} from 'lucide-react';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import { apiRequest } from '../api';

const WHY_CHOOSE_US = [
  { icon: BadgeCheck, title: 'Trusted Supplier', text: 'Years of consistent, transparent dealing with industrial and retail scrap partners.' },
  { icon: Handshake, title: 'Competitive Prices', text: 'Fair, market-linked rates on every category of ferrous and non-ferrous scrap.' },
  { icon: Truck, title: 'Fast Delivery', text: 'Dedicated logistics fleet for prompt pickup, weighing, and transportation.' },
  { icon: ShieldCheck, title: 'Quality Assurance', text: 'Every batch is graded and inspected before purchase or dispatch.' },
  { icon: Users, title: 'Experienced Team', text: 'Skilled inspectors and traders who know the metal market inside out.' },
];

const SERVICES = [
  { icon: PackageSearch, title: 'Scrap Purchasing', text: 'We buy ferrous, non-ferrous, and industrial scrap directly from source.' },
  { icon: Handshake, title: 'Scrap Sales', text: 'Bulk and retail supply of graded scrap material to manufacturers.' },
  { icon: Recycle, title: 'Industrial Recycling', text: 'End-to-end recycling for factory offcuts and process waste.' },
  { icon: Truck, title: 'Logistics Support', text: 'Collection, weighing, and transportation handled in-house.' },
  { icon: Factory, title: 'Waste Management', text: 'Structured waste handling programs for industrial clients.' },
  { icon: ClipboardList, title: 'Material Processing', text: 'Sorting, baling, and shredding to prepare material for resale.' },
];

const PROCESS_STEPS = [
  { title: 'Request a Quote', text: 'Share your material type and quantity for an initial estimate.' },
  { title: 'Material Inspection', text: 'Our team inspects and grades the scrap on-site or at our yard.' },
  { title: 'Price Confirmation', text: 'A final price is confirmed based on grade and market rate.' },
  { title: 'Collection & Transportation', text: 'We arrange pickup with weighing and documentation.' },
  { title: 'Recycling & Processing', text: 'Material is sorted, processed, and prepared for resale.' },
  { title: 'Delivery & Completion', text: 'Payment is settled and the transaction is closed out.' },
];

const TESTIMONIALS = [
  { name: 'Ahmed Raza', role: 'Procurement Manager, Steel Mill', quote: 'HF Traders has been our most reliable scrap partner for over three years — accurate grading, fair pricing, every time.' },
  { name: 'Sana Malik', role: 'Owner, Malik Fabrication', quote: 'Pickup is always on schedule and their inspection process is honest. That consistency is hard to find in this industry.' },
  { name: 'Bilal Hussain', role: 'Plant Manager, Alloy Works', quote: 'Their logistics team makes bulk collection effortless. We no longer worry about scrap disposal timelines.' },
];

const FAQS = [
  {
    icon: PackageSearch,
    q: 'What materials does HF Traders actually buy and sell?',
    a: "We work across seven full categories — Metal Scrap (aluminum, brass, copper, MS, steel, stainless steel, and insulated cable), Plastic & Drums (HDPE, PP, PVC, fiber, and used industrial drums), Batteries & Power (lead-acid, lithium, UPS units, solar panels), Electronics & IT (laptops, monitors, circuit boards, hard drives, and more), Home Appliances (AC units, refrigerators, washing machines), Industrial Equipment (motors and transformers), and General Waste & Materials (wood, tires, paper, bricks). That's 54 individual product lines in total — if it's scrap, we've likely got a home for it.",
  },
  {
    icon: DollarSign,
    q: 'How do you determine pricing for each material?',
    a: 'Every material is priced on its own grade, purity, and current market rate — a bright copper wire and a mixed steel offcut are worlds apart, and our quotes reflect that. Our team physically inspects the batch before confirming a final number, so what you see on your quote is what you get at collection, not a lowball figure revised down later.',
  },
  {
    icon: Truck,
    q: 'Do you handle pickup and transportation for bulk orders?',
    a: "Yes — collection, on-site weighing, and transportation are all handled by our own logistics team, not a third party. For recurring industrial suppliers we can also set up a scheduled pickup routine so scrap doesn't pile up on your floor waiting for a one-off visit.",
  },
  {
    icon: ShieldCheck,
    q: 'Is my data safe when I sell used electronics or hard drives?',
    a: 'Completely. Laptops, hard drives, mobile phones, and any other data-bearing equipment are securely wiped before resale or component recovery, following standard data-destruction practice. You get the value of the hardware without the risk of information going out the door with it.',
  },
  {
    icon: Award,
    q: 'How do you grade and inspect material quality?',
    a: 'Every batch — whether it is a drum of HDPE scrap or a pallet of electric motors — goes through a physical inspection against standard grading benchmarks for that material type before we confirm a price. This keeps our quotes accurate and protects both sides from disputes at collection time.',
  },
  {
    icon: Handshake,
    q: 'How and when do I get paid?',
    a: 'Payment is settled at the point of delivery and material verification, once weighing and grading are confirmed on-site. We work by bank transfer or another method agreed upfront — no waiting weeks for a cheque to clear, and no surprises on the final figure.',
  },
  {
    icon: Leaf,
    q: 'What happens to hazardous items like batteries and transformers?',
    a: 'Lead-acid and lithium batteries, fluorescent tubes, and oil-filled transformers are handled according to standard safety and environmental guidelines from collection through processing — kept separate from general scrap, stored correctly, and processed by people who know how to do it safely.',
  },
  {
    icon: Recycle,
    q: 'Why should I choose HF Traders over a smaller local scrap dealer?',
    a: "Breadth and consistency. Most local dealers handle two or three material types — we cover 54, across metals, plastics, e-waste, appliances, and industrial equipment, so you're not juggling five different buyers for one clean-out. Combine that with graded pricing, our own transportation, and 18+ years of industry experience under our CEO, and you get one reliable point of contact instead of five uncertain ones.",
  },
];

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

interface FaqItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  question: string;
  answer: string;
}

/**
 * Single FAQ row with a smooth expand/collapse using the CSS grid-rows trick
 * (0fr -> 1fr) instead of native <details>, so the height animates instead
 * of snapping open/closed.
 */
const FaqItem: React.FC<FaqItemProps> = ({ icon: Icon, question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`bg-white/5 border rounded-2xl transition-all duration-300 hover:border-white/20 ${
        open ? 'border-[#e8702a]/40 bg-white/[0.07]' : 'border-white/10'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="w-full flex items-center gap-4 px-5 sm:px-6 py-5 text-left"
      >
        <span
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
            open ? 'bg-[#e8702a] text-white' : 'bg-[#e8702a]/15 text-[#e8702a]'
          }`}
        >
          <Icon size={18} />
        </span>
        <span className="flex-1 text-white text-sm sm:text-base font-medium">{question}</span>
        <span
          className={`text-[#e8702a] text-xl leading-none shrink-0 transition-transform duration-300 ${
            open ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="px-5 sm:px-6 pb-5 pl-[4.25rem] text-white/60 text-sm leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const [contactForm, setContactForm] = useState({ fullName: '', email: '', phone: '', message: '' });
  const [contactStatus, setContactStatus] = useState<SubmitStatus>('idle');
  const [contactError, setContactError] = useState<string | null>(null);

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('submitting');
    setContactError(null);
    try {
      await apiRequest('/contact', { method: 'POST', body: contactForm });
      setContactStatus('success');
      setContactForm({ fullName: '', email: '', phone: '', message: '' });
    } catch (err) {
      setContactStatus('error');
      setContactError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen bg-black page-transition" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Hero — background, layout, and animations unchanged */}
      <Hero />

      {/* ===================== LEADERSHIP / CEO ===================== */}
      <section className="relative px-6 sm:px-10 md:px-14 py-24 border-t border-white/10 overflow-hidden">
        {/* Ambient accent glow behind the section */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#e8702a]/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-[#e8702a] text-xs font-semibold uppercase tracking-[0.15em]">Leadership</span>
            <h2 className="mt-3 text-white text-3xl sm:text-4xl font-playfair italic">Meet Our CEO</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12 md:gap-16 items-center">
            {/* Photo with decorative frame + floating experience badge */}
            <Reveal className="relative mx-auto md:mx-0">
              <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-[#e8702a]/40 via-[#e8702a]/10 to-transparent blur-sm" />
              <div className="relative w-64 sm:w-72 md:w-full aspect-[3/4] rounded-3xl overflow-hidden border border-white/15 shadow-[0_25px_70px_-15px_rgba(232,112,42,0.45)]">
                <img
                  src="/images/ceo-m-ramzan.png"
                  alt="M. Ramzan, CEO of HF Traders"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Floating experience badge */}
              <div className="absolute -bottom-5 -right-3 sm:-right-6 bg-[#0b0f1a] border border-[#e8702a]/40 rounded-2xl px-5 py-3.5 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)] flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#e8702a]/15 flex items-center justify-center shrink-0">
                  <Award size={18} className="text-[#e8702a]" />
                </span>
                <div className="leading-tight">
                  <p className="text-white text-lg font-bold">18+</p>
                  <p className="text-white/50 text-[10px] uppercase tracking-wide">Years Experience</p>
                </div>
              </div>
            </Reveal>

            {/* Bio + stats + quote */}
            <Reveal delay={100}>
              <h3 className="text-white text-2xl sm:text-3xl font-semibold">M. Ramzan</h3>
              <p className="text-[#e8702a] text-sm font-medium mt-1.5 uppercase tracking-wide">Chief Executive Officer</p>

              <p className="mt-5 text-white/65 text-sm sm:text-base leading-relaxed max-w-xl">
                With over 18 years of hands-on experience in the scrap trading and metal
                recycling industry, M. Ramzan has built HF Traders into a trusted partner for
                manufacturers and industries across the region — driven by transparent dealing,
                fair pricing, and a lasting commitment to sustainable recycling.
              </p>

              {/* Pull quote */}
              <div className="mt-6 pl-5 border-l-2 border-[#e8702a]/50">
                <p className="text-white/80 text-sm sm:text-base italic font-playfair">
                  "Every tonne we recycle responsibly is a tonne that doesn't need to be mined again."
                </p>
              </div>

              {/* Stat row */}
              <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
                <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-4 text-center hover:bg-white/[0.08] transition-colors">
                  <Award size={18} className="text-[#e8702a] mx-auto" />
                  <p className="mt-2 text-white text-lg font-bold">18+</p>
                  <p className="text-white/45 text-[10px] uppercase tracking-wide leading-tight">Years in Industry</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-4 text-center hover:bg-white/[0.08] transition-colors">
                  <Users size={18} className="text-[#e8702a] mx-auto" />
                  <p className="mt-2 text-white text-lg font-bold">500+</p>
                  <p className="text-white/45 text-[10px] uppercase tracking-wide leading-tight">Clients Served</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-4 text-center hover:bg-white/[0.08] transition-colors">
                  <ShieldCheck size={18} className="text-[#e8702a] mx-auto" />
                  <p className="mt-2 text-white text-sm font-bold leading-tight">Certified</p>
                  <p className="text-white/45 text-[10px] uppercase tracking-wide leading-tight">Scrap Trader</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== WHY CHOOSE US ===================== */}
      <section className="px-6 sm:px-10 md:px-14 py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <span className="text-[#e8702a] text-xs font-semibold uppercase tracking-[0.15em]">Why Choose Us</span>
            <h2 className="mt-3 text-white text-3xl sm:text-4xl font-playfair italic max-w-xl">
              Why Choose HF Traders
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
            {WHY_CHOOSE_US.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 150}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
                  <Icon size={24} className="text-[#e8702a]" />
                  <h3 className="mt-4 text-white text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-white/60 text-xs leading-relaxed">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== OUR SERVICES ===================== */}
      <section className="px-6 sm:px-10 md:px-14 py-20 border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <span className="text-[#e8702a] text-xs font-semibold uppercase tracking-[0.15em]">Our Services</span>
            <h2 className="mt-3 text-white text-3xl sm:text-4xl font-playfair italic max-w-xl">
              Comprehensive scrap &amp; recycling services
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {SERVICES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 150}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
                  <Icon size={24} className="text-[#e8702a]" />
                  <h3 className="mt-4 text-white text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-white/60 text-xs leading-relaxed">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== OUR PROCESS ===================== */}
      <section className="px-6 sm:px-10 md:px-14 py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <span className="text-[#e8702a] text-xs font-semibold uppercase tracking-[0.15em]">Our Process</span>
            <h2 className="mt-3 text-white text-3xl sm:text-4xl font-playfair italic max-w-xl">
              How a scrap deal moves from quote to completion
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 150} className="h-full">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
                  <span className="text-[#e8702a] text-xs font-semibold">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 text-white text-sm font-semibold">{step.title}</h3>
                  <p className="mt-2 text-white/60 text-xs leading-relaxed">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="px-6 sm:px-10 md:px-14 py-20 border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <span className="text-[#e8702a] text-xs font-semibold uppercase tracking-[0.15em]">Testimonials</span>
            <h2 className="mt-3 text-white text-3xl sm:text-4xl font-playfair italic max-w-xl">
              What our clients say
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 150} className="h-full">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 h-full hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
                  <Quote size={22} className="text-[#e8702a]" />
                  <p className="text-white/75 text-sm leading-relaxed">{t.quote}</p>
                  <div className="mt-auto pt-2 border-t border-white/10">
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-white/50 text-xs">{t.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="px-6 sm:px-10 md:px-14 py-24 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center">
            <span className="text-[#e8702a] text-xs font-semibold uppercase tracking-[0.15em]">FAQ</span>
            <h2 className="mt-3 text-white text-3xl sm:text-4xl font-playfair italic">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-white/55 text-sm sm:text-base max-w-xl mx-auto">
              Straight answers about our products, pricing, and process — from the team that handles every batch personally.
            </p>
          </Reveal>

          <div className="mt-12 flex flex-col gap-4">
            {FAQS.map((item, i) => (
              <Reveal key={item.q} delay={i * 130}>
                <FaqItem icon={item.icon} question={item.q} answer={item.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CONTACT ===================== */}
      <section id="contact" className="px-6 sm:px-10 md:px-14 py-20 border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <Reveal>
            <span className="text-[#e8702a] text-xs font-semibold uppercase tracking-[0.15em]">Contact</span>
            <h2 className="mt-3 text-white text-3xl sm:text-4xl font-playfair italic">
              Get in touch with our team
            </h2>
            <ul className="mt-8 flex flex-col gap-4 text-sm text-white/70">
              <li className="flex items-center gap-3"><MapPin size={18} className="text-[#e8702a]" /> Industrial Area, Sundar Road, Lahore, Pakistan</li>
              <li className="flex items-center gap-3"><Phone size={18} className="text-[#e8702a]" /> 0301-2059933</li>
              <li className="flex items-center gap-3"><MessageCircle size={18} className="text-[#e8702a]" /> WhatsApp: 0301-2059933</li>
              <li className="flex items-center gap-3"><Mail size={18} className="text-[#e8702a]" /> hanifusman695@gmail.com</li>
              <li className="flex items-center gap-3"><Clock size={18} className="text-[#e8702a]" /> Mon – Sat, 8:00 AM – 7:00 PM</li>
            </ul>
          </Reveal>

          <Reveal delay={100}>
          <form
            onSubmit={handleContactSubmit}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-4"
          >
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={contactForm.fullName}
              onChange={handleContactChange}
              required
              className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#e8702a] transition-colors"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={contactForm.email}
              onChange={handleContactChange}
              required
              className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#e8702a] transition-colors"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={contactForm.phone}
              onChange={handleContactChange}
              className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#e8702a] transition-colors"
            />
            <textarea
              name="message"
              placeholder="Message"
              rows={4}
              value={contactForm.message}
              onChange={handleContactChange}
              required
              className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#e8702a] transition-colors resize-none"
            />

            {contactStatus === 'success' && (
              <p className="text-emerald-400 text-xs">Thanks — your message has been sent. We'll be in touch shortly.</p>
            )}
            {contactStatus === 'error' && (
              <p className="text-red-400 text-xs">{contactError}</p>
            )}

            <button
              type="submit"
              disabled={contactStatus === 'submitting'}
              className="bg-[#e8702a] hover:bg-[#d2611f] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-95 self-start"
            >
              {contactStatus === 'submitting' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
