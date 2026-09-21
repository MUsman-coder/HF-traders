import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Plus, Pencil, Trash2, X, LogOut,
  Package, FileText, Mail, Briefcase, Users as UsersIcon, Eye, LayoutDashboard, Upload, Menu,
} from 'lucide-react';
import { adminApiRequest, getAdminToken, getAdminIdentity, clearAdminToken } from '../../adminApi';
import { INPUT_CLASSES_COMPACT as inputClasses } from '../../styles';
import Logo from '../../components/Logo';
import SubmissionDetailModal from '../../components/SubmissionDetailModal';
import AdminOverview from './AdminOverview';
import { uploadImageToCloudinary, isCloudinaryConfigured } from '../../cloudinary';

interface Product {
  id: string;
  name: string;
  category: string;
  type: string;
  grade: string;
  availability: 'In Stock' | 'Limited' | 'On Order';
  description: string;
  imageUrl?: string | null;
}

interface Contact {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

interface Quote {
  id: number;
  product_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

interface BusinessInquiry {
  id: number;
  plan_name: string;
  full_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

interface AdminUser {
  id: number;
  full_name: string;
  company_name: string | null;
  business_type: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
}

const CATEGORIES = [
  'Metal Scrap',
  'Plastic & Drums',
  'Batteries & Power',
  'Electronics & IT',
  'Home Appliances',
  'Industrial Equipment',
  'General Waste & Materials',
];

const SECTIONS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'quotes', label: 'Quotes', icon: FileText },
  { key: 'contacts', label: 'Contacts', icon: Mail },
  { key: 'business-plans', label: 'Business Plans', icon: Briefcase },
  { key: 'users', label: 'Users', icon: UsersIcon },
] as const;
type SectionKey = (typeof SECTIONS)[number]['key'];

const EMPTY_PRODUCT_FORM = {
  id: '',
  name: '',
  category: CATEGORIES[0],
  type: '',
  grade: '',
  availability: 'In Stock' as Product['availability'],
  description: '',
  imageUrl: '',
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const identity = getAdminIdentity();

  const [section, setSection] = useState<SectionKey>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [inquiries, setInquiries] = useState<BusinessInquiry[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const [detail, setDetail] = useState<
    | { kind: 'quote'; row: Quote }
    | { kind: 'contact'; row: Contact }
    | { kind: 'inquiry'; row: BusinessInquiry }
    | null
  >(null);

  useEffect(() => {
    if (!getAdminToken()) {
      navigate('/admin/login');
      return;
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, q, c, b, u] = await Promise.all([
        adminApiRequest<{ products: Product[] }>('/products'),
        adminApiRequest<{ quotes: Quote[] }>('/quotes'),
        adminApiRequest<{ contacts: Contact[] }>('/contacts'),
        adminApiRequest<{ inquiries: BusinessInquiry[] }>('/business-plan-inquiries'),
        adminApiRequest<{ users: AdminUser[] }>('/users'),
      ]);
      setProducts(p.products);
      setQuotes(q.quotes);
      setContacts(c.contacts);
      setInquiries(b.inquiries);
      setUsers(u.users);
    } catch (err) {
      if (err instanceof Error && err.message === 'UNAUTHORIZED') {
        navigate('/admin/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_PRODUCT_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      type: product.type,
      grade: product.grade,
      availability: product.availability,
      description: product.description,
      imageUrl: product.imageUrl || '',
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadError(null);

    if (!isCloudinaryConfigured()) {
      setImageUploadError('Cloudinary is not configured — set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in frontend/.env, or type a path into the field instead.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please choose an image file.');
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setImageUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await adminApiRequest(`/products/${editingId}`, { method: 'PUT', body: form });
      } else {
        await adminApiRequest('/products', { method: 'POST', body: form });
      }
      setFormOpen(false);
      await loadAll();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm(`Delete product "${id}"? This cannot be undone.`)) return;
    try {
      await adminApiRequest(`/products/${id}`, { method: 'DELETE' });
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete product.');
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Delete the account for "${user.full_name}" (${user.email})? This cannot be undone.`))
      return;
    try {
      await adminApiRequest(`/users/${user.id}`, { method: 'DELETE' });
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete user.');
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-black flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile top bar — only visible below md breakpoint */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3.5 bg-black border-b border-white/10">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open menu"
          className="text-white/70 hover:text-white p-1"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Logo size={22} />
          <span className="text-white text-sm font-semibold">HF Traders Admin</span>
        </div>
        <span className="w-[22px]" aria-hidden="true" />
      </div>

      {/* Backdrop — only shown while mobile sidebar is open */}
      {mobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ===================== SIDEBAR ===================== */}
      <aside
        className={`w-64 shrink-0 bg-[#0b0f1a] md:bg-white/[0.03] border-r border-white/10 flex flex-col h-screen fixed md:sticky top-0 left-0 z-50 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-5 flex items-center justify-between gap-2.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <div>
              <p className="text-white text-sm font-semibold leading-tight">HF Traders</p>
              <p className="text-white/40 text-[11px]">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
            className="md:hidden text-white/50 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {SECTIONS.map(({ key, label, icon: Icon }) => {
            const count =
              key === 'products' ? products.length
              : key === 'quotes' ? quotes.length
              : key === 'contacts' ? contacts.length
              : key === 'business-plans' ? inquiries.length
              : users.length;

            return (
              <button
                key={key}
                onClick={() => {
                  setSection(key);
                  setMobileSidebarOpen(false);
                }}
                className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  section === key
                    ? 'bg-[#e8702a] text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={16} />
                  {label}
                </span>
                {key !== 'overview' && (
                  <span className={`text-[11px] ${section === key ? 'text-white/80' : 'text-white/30'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          {identity && (
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <span className="w-8 h-8 rounded-full bg-[#e8702a]/20 flex items-center justify-center text-[#e8702a] text-xs font-bold shrink-0">
                {identity.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{identity.name}</p>
                <p className="text-white/40 text-[11px] truncate">{identity.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-white/60 hover:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-white/15 hover:bg-white/10 transition-colors"
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT ===================== */}
      <main className="flex-1 p-5 pt-20 md:p-8 md:pt-8 overflow-y-auto w-full md:ml-0">
        <h1 className="text-white text-2xl font-playfair italic mb-6">
          {SECTIONS.find((s) => s.key === section)?.label}
        </h1>

        {loading && (
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        )}

        {error && !loading && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && !error && (
          <>
            {section === 'overview' && (
              <AdminOverview
                products={products}
                quotes={quotes}
                contacts={contacts}
                inquiries={inquiries}
                users={users}
              />
            )}

            {section === 'products' && (
              <div>
                <button
                  onClick={openAddForm}
                  className="mb-5 flex items-center gap-2 bg-[#e8702a] hover:bg-[#d2611f] text-white text-xs font-medium px-4 py-2.5 rounded-full transition-colors"
                >
                  <Plus size={14} /> Add Product
                </button>

                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-white/5 text-white/50 text-xs uppercase tracking-wide">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Grade</th>
                        <th className="px-4 py-3">Availability</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-t border-white/10 text-white/80 hover:bg-white/[0.03]">
                          <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                          <td className="px-4 py-3 text-white/60">{p.category}</td>
                          <td className="px-4 py-3 text-white/60">{p.grade}</td>
                          <td className="px-4 py-3 text-white/60">{p.availability}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditForm(p)}
                                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                aria-label={`Edit ${p.name}`}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors"
                                aria-label={`Delete ${p.name}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {section === 'quotes' && (
              <SubmissionTable
                rows={quotes}
                columns={['product_name', 'full_name', 'email', 'status', 'created_at']}
                labels={['Product', 'Name', 'Email', 'Status', 'Date']}
                emptyLabel="No quote requests yet."
                onView={(row) => setDetail({ kind: 'quote', row })}
              />
            )}

            {section === 'contacts' && (
              <SubmissionTable
                rows={contacts}
                columns={['full_name', 'email', 'message', 'created_at']}
                labels={['Name', 'Email', 'Message', 'Date']}
                emptyLabel="No contact messages yet."
                onView={(row) => setDetail({ kind: 'contact', row })}
              />
            )}

            {section === 'business-plans' && (
              <SubmissionTable
                rows={inquiries}
                columns={['plan_name', 'full_name', 'company_name', 'email', 'created_at']}
                labels={['Plan', 'Name', 'Company', 'Email', 'Date']}
                emptyLabel="No business plan inquiries yet."
                onView={(row) => setDetail({ kind: 'inquiry', row })}
              />
            )}

            {section === 'users' && (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-white/5 text-white/50 text-xs uppercase tracking-wide">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                          No registered users yet.
                        </td>
                      </tr>
                    )}
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-white/10 text-white/80 hover:bg-white/[0.03]">
                        <td className="px-4 py-3 font-medium text-white">{u.full_name}</td>
                        <td className="px-4 py-3 text-white/60">{u.company_name || '—'}</td>
                        <td className="px-4 py-3 text-white/60">{u.email}</td>
                        <td className="px-4 py-3 text-white/60">{u.phone || '—'}</td>
                        <td className="px-4 py-3 text-white/60">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors"
                              aria-label={`Delete ${u.full_name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {formOpen && createPortal(
        <div
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="bg-[#0b0f1a] border border-white/15 rounded-2xl w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFormOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-white text-lg font-playfair italic">
              {editingId ? `Edit ${editingId}` : 'Add a new product'}
            </h3>

            <form onSubmit={handleSave} className="mt-6 flex flex-col gap-3">
              {!editingId && (
                <input
                  name="id"
                  placeholder="ID (e.g. copper-scrap) — lowercase, dashes only"
                  value={form.id}
                  onChange={handleFormChange}
                  required
                  className={inputClasses}
                />
              )}
              <input name="name" placeholder="Product Name" value={form.name} onChange={handleFormChange} required className={inputClasses} />

              <select name="category" value={form.category} onChange={handleFormChange} className={inputClasses}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-black">
                    {c}
                  </option>
                ))}
              </select>

              <input name="type" placeholder="Type (e.g. Copper)" value={form.type} onChange={handleFormChange} className={inputClasses} />
              <input name="grade" placeholder="Grade" value={form.grade} onChange={handleFormChange} className={inputClasses} />

              <select name="availability" value={form.availability} onChange={handleFormChange} className={inputClasses}>
                <option value="In Stock" className="bg-black">In Stock</option>
                <option value="Limited" className="bg-black">Limited</option>
                <option value="On Order" className="bg-black">On Order</option>
              </select>

              <textarea
                name="description"
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={handleFormChange}
                className={`${inputClasses} resize-none`}
              />

              <div className="flex gap-2">
                <input
                  name="imageUrl"
                  placeholder="/images/products/your-id.jpg or paste a URL"
                  value={form.imageUrl}
                  onChange={handleFormChange}
                  className={`${inputClasses} flex-1`}
                />
                <label className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3.5 rounded-xl border border-white/15 cursor-pointer transition-colors">
                  {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>
              {imageUploadError && <p className="text-red-400 text-xs -mt-1.5">{imageUploadError}</p>}

              {formError && <p className="text-red-400 text-xs">{formError}</p>}

              <button
                type="submit"
                disabled={saving}
                className="mt-1 bg-[#e8702a] hover:bg-[#d2611f] disabled:opacity-60 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all"
              >
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {detail?.kind === 'quote' && (
        <SubmissionDetailModal
          title={`Quote request — ${detail.row.product_name}`}
          rows={[
            { label: 'Name', value: detail.row.full_name },
            { label: 'Email', value: detail.row.email },
            { label: 'Phone', value: detail.row.phone },
            { label: 'Company', value: detail.row.company },
            { label: 'Message', value: detail.row.message },
            { label: 'Submitted', value: new Date(detail.row.created_at).toLocaleString() },
          ]}
          existingReply={detail.row.admin_reply}
          repliedAt={detail.row.replied_at}
          replyEndpoint={`/quotes/${detail.row.id}/reply`}
          onClose={() => setDetail(null)}
          onReplied={loadAll}
        />
      )}

      {detail?.kind === 'contact' && (
        <SubmissionDetailModal
          title="Contact message"
          rows={[
            { label: 'Name', value: detail.row.full_name },
            { label: 'Email', value: detail.row.email },
            { label: 'Phone', value: detail.row.phone },
            { label: 'Message', value: detail.row.message },
            { label: 'Submitted', value: new Date(detail.row.created_at).toLocaleString() },
          ]}
          existingReply={detail.row.admin_reply}
          repliedAt={detail.row.replied_at}
          replyEndpoint={`/contacts/${detail.row.id}/reply`}
          onClose={() => setDetail(null)}
          onReplied={loadAll}
        />
      )}

      {detail?.kind === 'inquiry' && (
        <SubmissionDetailModal
          title={`Business plan inquiry — ${detail.row.plan_name}`}
          rows={[
            { label: 'Name', value: detail.row.full_name },
            { label: 'Company', value: detail.row.company_name },
            { label: 'Email', value: detail.row.email },
            { label: 'Phone', value: detail.row.phone },
            { label: 'Message', value: detail.row.message },
            { label: 'Submitted', value: new Date(detail.row.created_at).toLocaleString() },
          ]}
          existingReply={detail.row.admin_reply}
          repliedAt={detail.row.replied_at}
          replyEndpoint={`/business-plan-inquiries/${detail.row.id}/reply`}
          onClose={() => setDetail(null)}
          onReplied={loadAll}
        />
      )}
    </div>
  );
};

/** Read-only table for submission-style data, with a "View" action per row. */
function SubmissionTable<T extends Record<string, unknown>>({
  rows,
  columns,
  labels,
  emptyLabel,
  onView,
}: {
  rows: T[];
  columns: string[];
  labels: string[];
  emptyLabel: string;
  onView: (row: T) => void;
}) {
  if (rows.length === 0) {
    return <p className="text-white/40 text-sm py-8 text-center">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-white/5 text-white/50 text-xs uppercase tracking-wide">
            {labels.map((l) => (
              <th key={l} className="px-4 py-3 whitespace-nowrap">
                {l}
              </th>
            ))}
            <th className="px-4 py-3 text-right">View</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-white/10 text-white/80 hover:bg-white/[0.03]">
              {columns.map((col) => (
                <td key={col} className="px-4 py-3 max-w-xs truncate" title={String(row[col] ?? '')}>
                  {col === 'created_at' && row[col]
                    ? new Date(row[col] as string).toLocaleString()
                    : String(row[col] ?? '—')}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => onView(row)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    aria-label="View details"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
