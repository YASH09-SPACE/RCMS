import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Clock, Bell, Database } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Settings = () => {
  const [slaDefaults, setSlaDefaults] = useState({
    LOW: 14,
    MEDIUM: 7,
    HIGH: 3,
    CRITICAL: 1,
  });

  const [notifications, setNotifications] = useState({
    emailNew: true,
    smsSla: true,
    pushStatus: true,
    weekly: false,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Settings" subtitle="Configure system defaults and preferences" />

      <div className="max-w-2xl space-y-6">
        {/* SLA Configuration */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-primary-500" />
            <CardTitle className="!mb-0">SLA Deadlines (Days)</CardTitle>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(slaDefaults).map(([key, val]) => (
              <Input
                key={key}
                label={`${key} Priority`}
                type="number"
                value={val}
                onChange={(e) => setSlaDefaults(s => ({ ...s, [key]: parseInt(e.target.value) || 0 }))}
              />
            ))}
          </div>
          <Button className="mt-4" size="sm">Save SLA Defaults</Button>
        </Card>

        {/* Notification Config */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-primary-500" />
            <CardTitle className="!mb-0">Notification Settings</CardTitle>
          </div>
          <div className="space-y-3">
            {[
              { key: 'emailNew', label: 'Email notifications for new issues' },
              { key: 'smsSla', label: 'SMS alerts for SLA breaches' },
              { key: 'pushStatus', label: 'Push notifications for status changes' },
              { key: 'weekly', label: 'Weekly digest emails' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-surface-raised cursor-pointer">
                <span className="text-sm text-foreground">{item.label}</span>
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={notifications[item.key]} 
                    onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="sr-only" 
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${notifications[item.key] ? 'bg-primary-500' : 'bg-border-strong'}`}>
                    <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* System Info */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Database size={18} className="text-primary-500" />
            <CardTitle className="!mb-0">System Information</CardTitle>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 rounded bg-surface-raised">
              <span className="text-muted">Version</span>
              <span className="font-mono text-foreground">v1.0.0</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-raised">
              <span className="text-muted">Environment</span>
              <span className="font-mono text-foreground">Development</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-raised">
              <span className="text-muted">API Status</span>
              <span className="font-mono text-accent-green">● Connected (mock)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-raised">
              <span className="text-muted">Database</span>
              <span className="font-mono text-foreground">Mock Data</span>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default Settings;
