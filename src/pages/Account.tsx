import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Building2, Calendar, LogOut, Camera, Loader2 } from 'lucide-react';
import PageShell from '../components/PageShell';
import { apiRequest } from '../api';
import { uploadImageToCloudinary, isCloudinaryConfigured } from '../cloudinary';

interface StoredUser {
  id: number;
  fullName: string;
  companyName?: string | null;
  businessType?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}

const MAX_AVATAR_BYTES = 1_500_000; // ~1.5MB, matches backend limit

const Account: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('hf_traders_user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
    setChecked(true);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('hf_traders_user');
    navigate('/login');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setAvatarError(null);

    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Image is too large. Please choose a photo under 1.5MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.');
      return;
    }

    setUploading(true);
    try {
      let avatarUrl: string;

      if (isCloudinaryConfigured()) {
        avatarUrl = await uploadImageToCloudinary(file);
      } else {
        // Fallback: store the image directly in the database as base64.
        // Works, but Cloudinary is the recommended path — see frontend README.
        avatarUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const data = await apiRequest<{ user: StoredUser }>('/signup/avatar', {
        method: 'POST',
        body: { userId: user.id, avatarUrl },
      });

      setUser(data.user);
      sessionStorage.setItem('hf_traders_user', JSON.stringify(data.user));
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Could not upload photo.');
    } finally {
      setUploading(false);
    }
  };

  if (checked && !user) {
    return (
      <PageShell eyebrow="Account" title="You're not logged in" subtitle="Log in to view your account details.">
        <Link
          to="/login"
          className="inline-block bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-95"
        >
          Go to Login
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Account"
      title={user ? `Welcome, ${user.fullName.split(' ')[0]}` : 'Account'}
      subtitle="Your registered business account details."
    >
      {user && (
        <div className="max-w-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-4 pb-6 border-b border-white/10">
            <div className="relative shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <span className="w-14 h-14 rounded-full bg-[#e8702a]/15 flex items-center justify-center text-[#e8702a] text-lg font-bold">
                  {user.fullName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                aria-label="Change profile picture"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#e8702a] hover:bg-[#d2611f] flex items-center justify-center text-white transition-colors"
              >
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-white text-lg font-semibold">{user.fullName}</p>
              {user.companyName && <p className="text-white/50 text-sm">{user.companyName}</p>}
            </div>
          </div>

          {avatarError && <p className="text-red-400 text-xs mt-3">{avatarError}</p>}

          <ul className="mt-6 flex flex-col gap-4 text-sm">
            <li className="flex items-center gap-3 text-white/75">
              <Mail size={16} className="text-[#e8702a] shrink-0" />
              {user.email}
            </li>
            {user.phone && (
              <li className="flex items-center gap-3 text-white/75">
                <Phone size={16} className="text-[#e8702a] shrink-0" />
                {user.phone}
              </li>
            )}
            {user.address && (
              <li className="flex items-center gap-3 text-white/75">
                <MapPin size={16} className="text-[#e8702a] shrink-0" />
                {user.address}
              </li>
            )}
            {user.businessType && (
              <li className="flex items-center gap-3 text-white/75">
                <Building2 size={16} className="text-[#e8702a] shrink-0" />
                <span className="capitalize">{user.businessType}</span>
              </li>
            )}
            {user.createdAt && (
              <li className="flex items-center gap-3 text-white/75">
                <Calendar size={16} className="text-[#e8702a] shrink-0" />
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </li>
            )}
          </ul>

          <button
            onClick={handleLogout}
            className="mt-8 flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium px-5 py-2.5 rounded-full border border-white/15 hover:bg-white/10 transition-colors"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      )}
    </PageShell>
  );
};

export default Account;
