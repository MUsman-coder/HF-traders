import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Package, FileText, Mail, Briefcase, Users as UsersIcon, Clock } from 'lucide-react';

interface Product {
  category: string;
}
interface DatedRow {
  created_at: string;
  admin_reply?: string | null;
}

interface AdminOverviewProps {
  products: Product[];
  quotes: DatedRow[];
  contacts: DatedRow[];
  inquiries: DatedRow[];
  users: DatedRow[];
}

const CATEGORY_COLORS = ['#e8702a', '#4e9bff', '#38e0d8', '#f0894f', '#7c5cff', '#34d399', '#f59e0b'];

const StatCard: React.FC<{ icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: number | string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
    <span className="w-11 h-11 rounded-xl bg-[#e8702a]/15 flex items-center justify-center shrink-0">
      <Icon size={20} className="text-[#e8702a]" />
    </span>
    <div>
      <p className="text-white text-2xl font-bold leading-tight">{value}</p>
      <p className="text-white/50 text-xs">{label}</p>
    </div>
  </div>
);

/** Builds a day-by-day count for the last N days, filling in zero-days. */
function buildDailyCounts(rows: DatedRow[], days = 14) {
  const counts: Record<string, number> = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    counts[key] = 0;
  }
  for (const row of rows) {
    const key = new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (key in counts) counts[key] += 1;
  }
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ products, quotes, contacts, inquiries, users }) => {
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) counts[p.category] = (counts[p.category] || 0) + 1;
    return Object.entries(counts).map(([category, count]) => ({ category, count }));
  }, [products]);

  const activityData = useMemo(() => {
    const allSubmissions = [...quotes, ...contacts, ...inquiries];
    return buildDailyCounts(allSubmissions, 14);
  }, [quotes, contacts, inquiries]);

  const pendingReplies = useMemo(() => {
    return [...quotes, ...contacts, ...inquiries].filter((r) => !r.admin_reply).length;
  }, [quotes, contacts, inquiries]);

  return (
    <div className="flex flex-col gap-8">
      {/* Stat boxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Package} label="Products" value={products.length} />
        <StatCard icon={FileText} label="Quotes" value={quotes.length} />
        <StatCard icon={Mail} label="Contacts" value={contacts.length} />
        <StatCard icon={Briefcase} label="Business Plans" value={inquiries.length} />
        <StatCard icon={UsersIcon} label="Users" value={users.length} />
        <StatCard icon={Clock} label="Awaiting Reply" value={pendingReplies} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity over time */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white text-sm font-semibold mb-4">Submissions — last 14 days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: '#0b0f1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#e8702a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Products by category */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white text-sm font-semibold mb-4">Products by category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
              >
                {categoryData.map((entry, i) => (
                  <Cell key={entry.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0b0f1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 12 }}
              />
              <Legend
                verticalAlign="bottom"
                height={60}
                wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
