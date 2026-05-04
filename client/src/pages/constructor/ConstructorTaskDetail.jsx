import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { constructorService } from '../../services/constructorService';
import ConstructorLayout from '../../components/ConstructorLayout';
import SLACountdown from '../../components/common/SLACountdown';
import ImageGallery from '../../components/common/ImageGallery';
import { ArrowLeft, MapPin, Clock, Camera, CheckCircle, Navigation, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_PHOTOS = 5;

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ConstructorTaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Submission State
  const [comments, setComments] = useState('');
  const [images, setImages] = useState([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getById(id);
      if (res.success) setTask(res.data);
    } catch (err) {
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async () => {
    setProcessing(true);
    try {
      // Create empty form data mapped to in_progress
      const fd = new FormData();
      fd.append('status', 'in_progress');
      
      await constructorService.updateTaskStatus(id, fd);
      toast.success('Work Started!');
      loadData();
    } catch (err) {
      toast.error('Failed to start work');
    } finally {
      setProcessing(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Validate photo count
      if (selectedFiles.length > MAX_PHOTOS) {
        toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
        e.target.value = ''; // Reset file input
        return;
      }
      
      setImages(selectedFiles);
      setPhotoCount(selectedFiles.length);
    }
  };

  const handleSubmitCompletion = async (e) => {
    e.preventDefault();
    if (images.length < 3) return toast.error('You must upload at least 3 photos proving the work is complete.');
    if (!comments) return toast.error('Please add a short note about the fix.');

    setProcessing(true);
    try {
      const fd = new FormData();
      fd.append('status', 'completed');
      fd.append('comments', comments);
      images.forEach(img => fd.append('images', img));

      await constructorService.updateTaskStatus(id, fd);
      toast.success('Proof uploaded and task marked completed!');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit proof');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <ConstructorLayout><div className="loading-spinner" style={{ minHeight: '60vh' }} /></ConstructorLayout>;
  if (!task) return <ConstructorLayout><div className="empty-state">Task not found</div></ConstructorLayout>;

  return (
    <ConstructorLayout>
      <Link to="/constructor/tasks" className="detail-back">
        <ArrowLeft size={16} /> Back to active tasks
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Complaint Details */}
        <div className="detail-card" style={{ maxWidth: 'none', margin: 0 }}>
          {/* Image Gallery */}
          <ImageGallery images={task.images} title="Original Photos (Reported Issue)" />
          
          <div className="detail-body">
            <div className="detail-header">
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span className={`badge badge-status badge-${task.status}`}>{task.status?.replace('_', ' ')}</span>
                  <span className="badge badge-category">{task.category?.name}</span>
                  {task.priority && <span className={`badge badge-${task.priority}`}>{task.priority} priority</span>}
                  {/* SLA Countdown */}
                  {task.slaDueDate && (
                    <SLACountdown 
                      slaDueDate={task.slaDueDate} 
                      isSlaBreached={task.isSlaBreached}
                      complaintStatus={task.status}
                      size="medium"
                    />
                  )}
                </div>
                <h1 className="detail-title">{task.title}</h1>
              </div>
              <span className="detail-id">{task.complaintNumber}</span>
            </div>

            <p className="detail-desc">{task.description}</p>

            <div className="detail-info-grid">
              <div className="detail-info-item">
                <div className="detail-info-label">Reported By Field Supervisor / Citizen</div>
                <div className="detail-info-value">{task.user?.name}</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">Reported On</div>
                <div className="detail-info-value"><Clock size={14} style={{ display: 'inline', marginRight: '4px' }}/> {new Date(task.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Address Box */}
            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <MapPin size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
               <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Location</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>{task.address}</p>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(task.address)}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: 'var(--primary)', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
                    <Navigation size={14} /> Open in Maps
                  </a>
               </div>
            </div>

          </div>
        </div>

        {/* Right Column: Worker Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Action Box: Start Work */}
          {task.status === 'assigned' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--info-bg)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Info size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Ready to begin?</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Once you arrive on site and are ready to execute the fix, mark the task as In Progress so the citizen and admin are notified.
              </p>
              <button onClick={handleStartWork} className="c-btn c-btn-primary" style={{ width: '100%' }} disabled={processing}>
                {processing ? 'Starting...' : 'Start Work Now'}
              </button>
            </div>
          )}

          {/* Action Box: Upload Proof */}
          {task.status === 'in_progress' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} color="var(--success)" /> Submit Completion Proof
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                Upload an "after" photo clearly showing the resolved issue. This will be verified by the Admin.
              </p>
              
              <form onSubmit={handleSubmitCompletion}>
                <div className="c-form-group">
                  <label className="c-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Completion Photos (min 3, max 5)</span>
                    {images.length > 0 && (
                      <span style={{
                        background: images.length >= 3 ? 'var(--success-bg)' : 'var(--error-bg)',
                        color: images.length >= 3 ? 'var(--success)' : 'var(--error)',
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {photoCount} / 3 minimum
                      </span>
                    )}
                  </label>
                  
                  {/* Drag & Drop Zone */}
                  <label 
                    className="upload-area" 
                    style={{ 
                      minHeight: images.length > 0 ? '80px' : '130px',
                      padding: images.length > 0 ? '16px' : '28px 24px',
                      cursor: photoCount >= MAX_PHOTOS ? 'not-allowed' : 'pointer',
                      opacity: photoCount >= MAX_PHOTOS ? 0.5 : 1,
                      borderColor: images.length > 0 ? 'var(--success)' : undefined,
                      background: images.length > 0 ? 'var(--success-bg)' : undefined
                    }}
                  >
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      disabled={photoCount >= MAX_PHOTOS}
                      required={images.length === 0}
                      style={{ display: 'none' }}
                    />
                    <Camera size={images.length > 0 ? 20 : 28} color={images.length > 0 ? "var(--success)" : "var(--primary)"} />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                      {images.length > 0 
                        ? 'Click to change photos' 
                        : 'Click or drag photos here'
                      }
                    </span>
                    {images.length === 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Upload at least 3 photos (JPG, PNG)
                      </span>
                    )}
                  </label>

                  {/* Photo Previews */}
                  {images.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      flexWrap: 'wrap', 
                      marginTop: '12px' 
                    }}>
                      {images.map((img, idx) => (
                        <div key={idx} style={{ 
                          position: 'relative', 
                          width: '72px', 
                          height: '72px', 
                          borderRadius: 'var(--radius-sm)', 
                          overflow: 'hidden',
                          border: '2px solid var(--border)',
                          flexShrink: 0
                        }}>
                          <img 
                            src={URL.createObjectURL(img)} 
                            alt={`Preview ${idx + 1}`} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }} 
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              const newImages = images.filter((_, i) => i !== idx);
                              setImages(newImages);
                              setPhotoCount(newImages.length);
                            }}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: 'rgba(239, 68, 68, 0.9)',
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700,
                              lineHeight: 1,
                              padding: 0
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="c-form-group">
                  <label className="c-form-label">Worker's Note</label>
                  <textarea 
                    className="c-form-textarea" 
                    value={comments} 
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="e.g., Pothole filled and sealed properly."
                    rows="3"
                    required
                  />
                </div>

                <button type="submit" className="c-btn c-btn-primary" style={{ 
                  width: '100%', 
                  background: images.length > 0 ? 'var(--success)' : 'var(--primary)',
                  height: '48px',
                  fontSize: '15px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  gap: '8px'
                }} disabled={processing}>
                  {processing ? 'Uploading...' : (
                    <>
                      <CheckCircle size={18} /> Submit & Close Task
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Action Box: Completed/Closed State */}
          {['completed', 'closed'].includes(task.status) && (
            <div style={{ background: 'var(--success-bg)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle size={20} color="var(--success)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--success)' }}>Work Submitted</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {task.status === 'completed' ? 'Your proof has been submitted and is pending verification by the Ward Admin.' : 'The Ward Admin has verified and officially closed this task. Great job!'}
              </p>
            </div>
          )}

        </div>
      </div>
    </ConstructorLayout>
  );
};

export default ConstructorTaskDetail;
