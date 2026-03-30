import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Bell, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    notifyPush: user?.notifyPush ?? true,
    notifyEmail: user?.notifyEmail ?? true,
    notifySMS: user?.notifySMS ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateProfile(formData);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Profile Settings" subtitle="Manage your account and notification preferences" />

      <div className="max-w-2xl space-y-6">
        {/* Avatar & role */}
        <Card>
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="xl" />
            <div>
              <h2 className="text-lg font-bold text-foreground">{user?.name}</h2>
              <p className="text-sm text-muted capitalize flex items-center gap-1.5">
                <Shield size={14} /> {user?.role} Account
              </p>
              <p className="text-xs text-subtle mt-1">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Personal info */}
        <Card>
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserIcon size={18} className="text-primary-500" /> Personal Information
          </h3>
          <div className="space-y-4">
            <Input label="Full Name" value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} />
            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))} />
            <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))} />
          </div>
        </Card>

        {/* Notification preferences */}
        <Card>
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell size={18} className="text-primary-500" /> Notification Preferences
          </h3>
          <div className="space-y-3">
            {[
              { key: 'notifyPush', label: 'Push Notifications', desc: 'Receive in-app push notifications for status updates' },
              { key: 'notifyEmail', label: 'Email Notifications', desc: 'Receive email alerts for important updates' },
              { key: 'notifySMS', label: 'SMS Notifications', desc: 'Receive SMS messages for status changes' },
            ].map(pref => (
              <label key={pref.key} className="flex items-center justify-between p-3 rounded-xl bg-surface-raised cursor-pointer group hover:bg-primary-50 transition-colors">
                <div>
                  <span className="text-sm font-medium text-foreground block">{pref.label}</span>
                  <span className="text-xs text-muted">{pref.desc}</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[pref.key]}
                    onChange={(e) => setFormData(f => ({ ...f, [pref.key]: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${formData[pref.key] ? 'bg-primary-500' : 'bg-border-strong'}`}>
                    <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${formData[pref.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button icon={Save} loading={saving} onClick={handleSave}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          {saved && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-accent-green font-medium">
              ✓ Saved successfully
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
