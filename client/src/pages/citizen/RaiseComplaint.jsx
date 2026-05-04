import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, Upload, MapPin, CheckCircle } from 'lucide-react';
import { complaintService, locationService } from '../../services/complaintService';
import CitizenLayout from '../../components/CitizenLayout';
import CustomSelect from '../../components/CustomSelect';
import GoogleMapPicker from '../../components/common/GoogleMapPicker';
import toast from 'react-hot-toast';

const categoryIcons = {
  'Pothole': '🕳️',
  'Street Light': '💡',
  'Drainage': '🚰',
  'Garbage Collection': '🗑️',
  'Water Supply': '💧',
  'Park Maintenance': '🌳',
};

const RaiseComplaint = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);

  const [form, setForm] = useState({
    category: '',
    categoryName: '',
    district: '',
    ward: '',
    address: '',
    title: '',
    description: '',
    latitude: null,
    longitude: null,
    districtName: '',
    wardName: '',
    images: []
  });

  const [geocoding, setGeocoding] = useState(false);

  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    locationService.getDistricts().then(res => {
      if (res.success) setDistricts(res.data);
    }).catch(() => {});
    // Fetch categories from API
    complaintService.getAll({ limit: 0 }); // warm up
    import('../../services/complaintService').then(mod => {
      mod.categoryService.getAll().then(res => {
        if (res.success) setDbCategories(res.data);
      }).catch(() => {});
    });
  }, []);

  const handleLocationSelect = async (locationData) => {
    const { latitude, longitude, address, pincode, addressComponents } = locationData;
    
    setForm(prev => ({ 
      ...prev, 
      latitude, 
      longitude,
      address: address || prev.address
    }));
    
    setGeocoding(true);
    try {
      // Use pincode or coordinates to fetch ward/district from backend
      const res = await locationService.reverseGeocode(latitude, longitude);
      if (res.success && res.data) {
        setForm(prev => ({ 
          ...prev, 
          district: res.data.districtId,
          districtName: res.data.districtName,
          ward: res.data.wardId,
          wardName: res.data.wardName
        }));
        toast.success(`Location identified: ${res.data.districtName} / ${res.data.wardName}`);
      }
    } catch (err) {
      setForm(prev => ({ ...prev, district: '', ward: '', districtName: '', wardName: '' }));
      toast.error(err.response?.data?.message || 'Location could not be verified. Please select within Gujarat.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + form.images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setForm(prev => ({ ...prev, images: [...prev.images, ...files] }));

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    setImagePreview(prev => prev.filter((_, i) => i !== idx));
  };

  const canNext = () => {
    if (step === 1) return form.category;
    if (step === 2) return form.district && form.address && !geocoding;
    if (step === 3) return form.title && form.description && form.images.length >= 3;
    return true;
  };

  const handleSubmit = async () => {
    if (form.images.length < 3) {
      toast.error('Please upload at least 3 photos as proof');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('category', form.category);
      formData.append('district', form.district);
      formData.append('ward', form.ward);
      formData.append('address', form.address);
      formData.append('title', form.title);
      formData.append('description', form.description);
      if (form.latitude) formData.append('latitude', form.latitude);
      if (form.longitude) formData.append('longitude', form.longitude);
      form.images.forEach(img => formData.append('images', img));

      const res = await complaintService.create(formData);
      if (res.success) {
        toast.success(res.message || 'Complaint registered!');
        navigate('/citizen/my-complaints');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CitizenLayout>
      <div className="raise-page">
        <Link to="/" className="detail-back">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="raise-card">
          <h1>Report an Issue</h1>
          <p className="subtitle">Help us fix infrastructure problems in your area</p>

          {/* Progress Steps */}
          <div className="raise-steps">
            {[1,2,3,4].map(s => (
              <div key={s} className={`raise-step ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`} />
            ))}
          </div>

          {/* STEP 1: Category */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                What type of issue?
              </h3>
              <div className="category-grid">
                {(dbCategories.length > 0 ? dbCategories : []).map(cat => (
                  <button
                    key={cat._id}
                    className={`category-chip ${form.category === cat._id ? 'selected' : ''}`}
                    onClick={() => {
                      setForm(prev => ({ ...prev, categoryName: cat.name, category: cat._id }));
                    }}
                  >
                    <span className="category-chip-icon">{categoryIcons[cat.name] || '📋'}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                <MapPin size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                Where is the issue?
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <GoogleMapPicker onSelectLocation={handleLocationSelect} />
                {geocoding && <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>Analyzing coordinates...</div>}
                
                {form.districtName && !geocoding && (
                  <div style={{ marginTop: '12px', padding: '12px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '8px', fontSize: '14px', border: '1px solid currentColor' }}>
                    <strong>Detected Region:</strong> {form.districtName} {form.wardName ? `> ${form.wardName}` : ''}
                  </div>
                )}
              </div>

              <div className="c-form-group">
                <label className="c-form-label">Full Address / Landmark</label>
                <input
                  type="text"
                  className="c-form-input"
                  placeholder="e.g., Near SBI Bank, MG Road, Ahmedabad"
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Details */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                Describe the issue
              </h3>

              <div className="c-form-group">
                <label className="c-form-label">Title</label>
                <input
                  type="text"
                  className="c-form-input"
                  placeholder="Brief title for the issue"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  maxLength={200}
                />
              </div>

              <div className="c-form-group">
                <label className="c-form-label">Description</label>
                <textarea
                  className="c-form-textarea"
                  placeholder="Describe the issue in detail..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  maxLength={2000}
                />
              </div>

              <div className="c-form-group">
                <label className="c-form-label">Photos (min 3, max 5) <span style={{ color: form.images.length >= 3 ? 'var(--success)' : 'var(--error)', fontWeight: 400, fontSize: '12px' }}>— {form.images.length}/3 minimum</span></label>
                <label className="upload-area">
                  <Camera size={24} style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>Click to upload photos</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>Upload at least 3 photos (JPG, PNG up to 5MB each)</div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {imagePreview.length > 0 && (
                  <div className="upload-preview">
                    {imagePreview.map((src, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={src} className="upload-preview-img" alt={`Preview ${i}`} />
                        <button
                          onClick={() => removeImage(i)}
                          style={{
                            position: 'absolute', top: '-6px', right: '-6px',
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: 'var(--error)', color: '#fff', border: 'none',
                            cursor: 'pointer', fontSize: '12px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                          }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                <CheckCircle size={18} style={{ verticalAlign: 'middle', marginRight: '6px', color: 'var(--success)' }} />
                Review & Submit
              </h3>

              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <div className="detail-info-label">Category</div>
                  <div className="detail-info-value">{form.categoryName}</div>
                </div>
                <div className="detail-info-item">
                  <div className="detail-info-label">District</div>
                  <div className="detail-info-value">{districts.find(d => d._id === form.district)?.name}</div>
                </div>
                <div className="detail-info-item">
                  <div className="detail-info-label">Ward</div>
                  <div className="detail-info-value">{wards.find(w => w._id === form.ward)?.wardName || 'Selected'}</div>
                </div>
                <div className="detail-info-item">
                  <div className="detail-info-label">Address</div>
                  <div className="detail-info-value">{form.address}</div>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div className="detail-info-label">Title</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{form.title}</div>
                <div className="detail-info-label">Description</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{form.description}</div>
              </div>

              {imagePreview.length > 0 && (
                <div className="upload-preview" style={{ marginBottom: '16px' }}>
                  {imagePreview.map((src, i) => (
                    <img key={i} src={src} className="upload-preview-img" alt={`Photo ${i}`} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-actions">
            {step > 1 && (
              <button className="c-btn c-btn-outline" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            {step < 4 ? (
              <button
                className="c-btn c-btn-primary"
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="c-btn c-btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
            )}
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
};

export default RaiseComplaint;
