import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Camera, Send, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';

const CATEGORIES = [
  { value: 'POTHOLE', label: '🕳️ Pothole' },
  { value: 'STREETLIGHT', label: '💡 Streetlight' },
  { value: 'DRAIN', label: '🌊 Drain / Waterlogging' },
  { value: 'ROAD_CRACK', label: '⚡ Road Crack' },
  { value: 'SIGNAGE', label: '🪧 Signage' },
  { value: 'OTHER', label: '📋 Other' },
];

const ReportIssue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    latitude: 23.0225,
    longitude: 72.5714,
    address: '',
    photos: [],
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    updateField('photos', [...formData.photos, ...previews].slice(0, 5));
  };

  const removePhoto = (id) => {
    updateField('photos', formData.photos.filter(p => p.id !== id));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // In production, call API here
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center min-h-[60vh]">
        <Card className="text-center max-w-md mx-auto p-8">
          <div className="inline-flex p-4 rounded-2xl bg-accent-green-light mb-4">
            <CheckCircle size={40} className="text-accent-green" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Report Submitted!</h2>
          <p className="text-sm text-muted mb-2">Your report has been submitted successfully and will be reviewed shortly.</p>
          <p className="text-xs font-mono text-primary-500 mb-6">Issue ID: ISS-{String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/citizen/dashboard')}>Go to Dashboard</Button>
            <Button onClick={() => { setSubmitted(false); setStep(1); setFormData({ title: '', category: '', description: '', latitude: 23.0225, longitude: 72.5714, address: '', photos: [] }); }}>Report Another</Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Report an Issue"
        subtitle="Help improve your city by reporting road infrastructure problems"
        breadcrumb={[{ label: 'Dashboard', href: '/citizen/dashboard' }, { label: 'Report Issue' }]}
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['Location', 'Details', 'Photos', 'Review'].map((label, idx) => (
          <div key={idx} className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step > idx + 1 ? 'bg-accent-green text-white' :
              step === idx + 1 ? 'bg-primary-500 text-white shadow-glow' :
              'bg-surface-raised text-subtle border border-border'
            }`}>
              {step > idx + 1 ? '✓' : idx + 1}
            </div>
            <span className={`hidden sm:block text-xs font-medium ${step === idx + 1 ? 'text-foreground' : 'text-subtle'}`}>
              {label}
            </span>
            {idx < 3 && <div className={`flex-1 h-0.5 rounded ${step > idx + 1 ? 'bg-accent-green' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      <Card className="max-w-2xl">
        {/* Step 1: Location */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-primary-500" /> Location
            </h3>
            <div className="w-full h-64 rounded-xl bg-surface-raised border border-border mb-4 flex items-center justify-center text-muted text-sm overflow-hidden">
              <div className="text-center">
                <MapPin size={32} className="mx-auto text-primary-500 mb-2" />
                <p className="font-medium text-foreground">Map Component</p>
                <p className="text-xs text-muted mt-1">📍 Ahmedabad, India (23.0225, 72.5714)</p>
                <p className="text-xs text-subtle mt-1">Drag pin to adjust location</p>
              </div>
            </div>
            <Input
              label="Address"
              placeholder="Auto-detected address or enter manually"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
          </motion.div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Issue Details</h3>
            <div className="space-y-4">
              <Input label="Title" placeholder="e.g. Large pothole on MG Road" value={formData.title} onChange={(e) => updateField('title', e.target.value)} />
              <Select label="Category" options={CATEGORIES} value={formData.category} onChange={(e) => updateField('category', e.target.value)} />
              <Textarea label="Description" placeholder="Describe the issue in detail..." rows={5} value={formData.description} onChange={(e) => updateField('description', e.target.value)} />
            </div>
          </motion.div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <Camera size={20} className="text-primary-500" /> Photos
            </h3>
            <p className="text-sm text-muted mb-4">Upload up to 5 photos of the issue</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {formData.photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img src={photo.url} alt="" className="w-full h-32 object-cover rounded-xl border border-border" />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {formData.photos.length < 5 && (
                <label className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary-500 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <Camera size={24} className="text-subtle mb-1" />
                  <span className="text-xs text-subtle">Add photo</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Review & Submit</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-surface-raised">
                <span className="text-xs text-subtle block">Title</span>
                <span className="text-sm font-medium text-foreground">{formData.title || '—'}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-raised">
                <span className="text-xs text-subtle block">Category</span>
                <span className="text-sm font-medium text-foreground">{CATEGORIES.find(c => c.value === formData.category)?.label || '—'}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-raised">
                <span className="text-xs text-subtle block">Description</span>
                <span className="text-sm text-foreground">{formData.description || '—'}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-raised">
                <span className="text-xs text-subtle block">Address</span>
                <span className="text-sm text-foreground">{formData.address || 'Auto-detected from GPS'}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-raised">
                <span className="text-xs text-subtle block">Photos</span>
                <span className="text-sm text-foreground">{formData.photos.length} photo(s) attached</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Back
          </Button>
          {step < 4 ? (
            <Button iconRight={ArrowRight} onClick={() => setStep(Math.min(4, step + 1))}>
              Continue
            </Button>
          ) : (
            <Button icon={Send} onClick={handleSubmit}>
              Submit Report
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default ReportIssue;
