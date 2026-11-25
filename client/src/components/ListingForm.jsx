import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getImageUrl } from '../lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Shared form for creating and editing resource listings.
 * Enforces Safe Pickup Zones from GET /api/items/pickup-zones and supports Multer image upload.
 */
export default function ListingForm({
  title,
  submitLabel,
  initialData = null,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'books',
    condition: 'good',
    deposit: 0,
    imageUrl: '',
    pickupLocation: '',
  });

  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || 'books',
        condition: initialData.condition || 'good',
        deposit: initialData.deposit ?? 0,
        imageUrl: initialData.imageUrl || '',
        pickupLocation: initialData.pickupLocation || '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    let active = true;
    const fetchZones = async () => {
      try {
        setZonesLoading(true);
        setZonesError('');
        const res = await axios.get('/items/pickup-zones');
        if (active) {
          setZones(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (active) {
          setZonesError(err.response?.data?.message || 'Failed to load Safe Pickup Zones.');
        }
      } finally {
        if (active) setZonesLoading(false);
      }
    };
    fetchZones();
    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Only JPG, PNG, WEBP, and GIF images are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File is too large. Maximum allowed size is 5MB.');
      return;
    }

    const body = new FormData();
    body.append('image', file);

    setUploading(true);
    try {
      const res = await axios.post('/upload', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        deposit: Number(formData.deposit) || 0,
      });
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to save listing. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in flex justify-center">
      <div className="card glass-panel w-full max-w-[600px]">
        <h2 className="mb-6">{title}</h2>

        {submitError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="text-muted text-sm mb-1.5">Item Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Arduino Uno R3"
          />

          <label className="text-muted text-sm mb-1.5">Description</label>
          <textarea
            name="description"
            required
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide details about the item..."
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-muted text-sm mb-1.5 block">Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="books">Books</option>
                <option value="electronics">Electronics/Gadgets</option>
                <option value="lab">Lab Equipment</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-muted text-sm mb-1.5 block">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange}>
                <option value="new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="sm:w-1/3">
              <label className="text-muted text-sm mb-1.5 block">Deposit (₹)</label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="sm:w-2/3">
              <label className="text-muted text-sm mb-1.5 block">Safe Pickup Zone</label>
              {zonesError ? (
                <div className="p-2.5 mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs">
                  {zonesError}
                </div>
              ) : (
                <select
                  name="pickupLocation"
                  required
                  disabled={zonesLoading}
                  value={formData.pickupLocation}
                  onChange={handleChange}
                >
                  <option value="">
                    {zonesLoading ? 'Loading Safe Pickup Zones...' : 'Select an authorized Safe Pickup Zone'}
                  </option>
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-muted text-sm mb-1.5 block">Item Photo (Optional, max 5MB)</label>
            <div className="flex flex-col gap-3 p-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-dark)]/40">
              <div className="flex items-center gap-3 flex-wrap">
                <label className="btn btn-secondary text-xs py-2 px-3 cursor-pointer m-0">
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-[var(--text-muted)]">or paste an image URL below</span>
              </div>

              {uploadError && (
                <p className="text-xs text-red-500 m-0 flex items-center gap-1">
                  <AlertCircle size={13} /> {uploadError}
                </p>
              )}

              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://... or /uploads/..."
                className="m-0 text-sm"
              />

              {formData.imageUrl && (
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={getImageUrl(formData.imageUrl)}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-[var(--border)]"
                  />
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <ImageIcon size={13} /> Image preview ready
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || uploading || zonesLoading || Boolean(zonesError)}
            className="btn btn-primary mt-2"
          >
            {submitting ? 'Saving...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
