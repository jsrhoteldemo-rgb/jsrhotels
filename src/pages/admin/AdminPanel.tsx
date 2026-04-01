import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, Dispatch, FormEvent, ReactNode, SetStateAction } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import {
  Activity,
  BriefcaseBusiness,
  Building2,
  FileBadge,
  FileText,
  GalleryVerticalEnd,
  Globe2,
  Home,
  Contact,
  ImagePlus,
  Inbox,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  User,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import {
  ADMIN_IDLE_TIMEOUT_MS,
  ADMIN_LAST_ACTIVITY_KEY,
  apiRequest,
  getAdminToken,
  setAdminToken,
  touchAdminSession,
  uploadFile,
} from '../../api/http';
import { resolveAssetUrl } from '../../config/api';
import { noImagePlaceholder } from '../../data/fallbackContent';
import {
  isStrongPassword,
  isValidEmail,
  isValidUsPhone,
  normalizeEmail,
} from '../../utils/validation';
import type {
  AboutSection,
  ContentPageSection,
  HomeBlock,
  HotelBrand,
  PortfolioProperty,
  ServiceItem,
  SocialLink,
  TeamMember,
} from '../../types/content';

import './AdminPanel.css';

type AdminTabKey =
  | 'dashboard'
  | 'profile'
  | 'admins'
  | 'home'
  | 'about'
  | 'culture'
  | 'awards'
  | 'services'
  | 'team'
  | 'brands'
  | 'properties'
  | 'social'
  | 'contactInfo'
  | 'contactMessages'
  | 'careers'
  | 'legal'
  | 'site'
  | 'activity';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  isSystemAdmin: boolean;
  profileImageAssetId?: string | null;
  profileImageAsset?: {
    id: string;
    url: string;
  } | null;
}

interface ActivityLog {
  id: string;
  adminFullName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
}

interface UsState {
  code: string;
  name: string;
}

interface UsCity {
  name: string;
  stateCode: string;
}

interface AddressSuggestion {
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
}

interface DashboardPayload {
  totalVisits: number;
  uniqueVisitors: number;
  topSections: Array<{ sectionKey: string; views: number }>;
  topProperties: Array<{ propertyId?: string | null; title: string; views: number }>;
}

interface AdminNotice {
  type: 'success' | 'error' | 'info';
  message: string;
}

type ContactMessageStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';
type CareerApplicationStatus = 'NEW' | 'REVIEWING' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';

interface CareerOpportunityEntry {
  id: string;
  title: string;
  department?: string | null;
  employmentType?: string | null;
  locationCity?: string | null;
  locationState?: string | null;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ContactMessageEntry {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: ContactMessageStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CareerApplicationEntry {
  id: string;
  jobOpportunityId?: string | null;
  jobOpportunity?: {
    id: string;
    title: string;
    department?: string | null;
    employmentType?: string | null;
    locationCity?: string | null;
    locationState?: string | null;
  } | null;
  fullName: string;
  email: string;
  phone: string;
  city?: string | null;
  state?: string | null;
  position: string;
  experienceYears?: number | null;
  coverLetter?: string | null;
  resumeOriginalName: string;
  resumeMimeType: string;
  resumeSize: number;
  resumeUrl: string;
  status: CareerApplicationStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

type ModerationModalState =
  | {
      kind: 'contact';
      id: string;
      title: string;
      subtitle: string;
      messageBody: string;
      status: ContactMessageStatus;
      adminNotes: string;
    }
  | {
      kind: 'career';
      id: string;
      title: string;
      subtitle: string;
      messageBody: string;
      status: CareerApplicationStatus;
      adminNotes: string;
      resumeUrl: string;
      resumeLabel: string;
      resumeSize: number;
    };

interface PropertyFormState {
  title: string;
  slug: string;
  brandId: string;
  shortDescription: string;
  fullDescription: string;
  status: 'UNDER_CONSTRUCTION' | 'COMPLETED';
  isVisible: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: 'USA';
  sortOrder: number;
  keyInfoText: string;
  coverImageAssetId: string;
}

const tabItems: Array<{ key: AdminTabKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'home', label: 'Home Blocks', icon: Home },
  { key: 'about', label: 'About', icon: FileText },
  { key: 'culture', label: 'Culture', icon: FileText },
  { key: 'services', label: 'Services', icon: Wrench },
  { key: 'awards', label: 'Awards', icon: FileBadge },
  { key: 'team', label: 'Meet Our Team', icon: Users },
  { key: 'brands', label: 'Hotel Brands', icon: Building2 },
  { key: 'properties', label: 'Manage Portfolio', icon: GalleryVerticalEnd },
  { key: 'contactInfo', label: 'Contact Info', icon: Contact },
  { key: 'contactMessages', label: 'Contact Messages', icon: Inbox },
  { key: 'careers', label: 'Careers Inbox', icon: BriefcaseBusiness },
  { key: 'social', label: 'Social Links', icon: Link2 },
  { key: 'legal', label: 'Legal', icon: FileBadge },
  { key: 'site', label: 'Site Settings', icon: Settings },
  { key: 'admins', label: 'Admins', icon: ShieldCheck },
  { key: 'activity', label: 'Activity Logs', icon: Activity },
];

const profileTabMeta = { key: 'profile' as const, label: 'Profile & Security', icon: User };

const propertyStatusOptions: Array<{ value: PropertyFormState['status']; label: string }> = [
  { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
  { value: 'COMPLETED', label: 'Completed' },
];

const emptyPropertyForm: PropertyFormState = {
  title: '',
  slug: '',
  brandId: '',
  shortDescription: '',
  fullDescription: '',
  status: 'UNDER_CONSTRUCTION',
  isVisible: true,
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: 'CA',
  zipCode: '',
  country: 'USA',
  sortOrder: 0,
  keyInfoText: '',
  coverImageAssetId: '',
};

const defaultLegalDocs = {
  PRIVACY: { title: 'Privacy Policy', content: '' },
  TERMS: { title: 'Terms & Conditions', content: '' },
};

const contactMessageStatusOptions: ContactMessageStatus[] = [
  'NEW',
  'IN_PROGRESS',
  'RESOLVED',
  'ARCHIVED',
];

const careerStatusOptions: CareerApplicationStatus[] = [
  'NEW',
  'REVIEWING',
  'SHORTLISTED',
  'REJECTED',
  'HIRED',
];

type HomeBlockSectionType =
  | 'hero'
  | 'pillars'
  | 'intro'
  | 'stats'
  | 'featured'
  | 'leadership'
  | 'news'
  | 'accolades'
  | 'newsletter';

interface HomeBlockSectionConfig {
  type: HomeBlockSectionType;
  label: string;
  subtitle: string;
  defaultSortOrder: number;
}

const homeBlockSectionConfigs: HomeBlockSectionConfig[] = [
  {
    type: 'hero',
    label: 'Hero Section',
    subtitle: 'Main banner content, call-to-action, and hero image.',
    defaultSortOrder: 1,
  },
  {
    type: 'pillars',
    label: 'Core Pillars',
    subtitle: 'Pillar cards with icon, title, and description items.',
    defaultSortOrder: 2,
  },
  {
    type: 'intro',
    label: 'Intro Section',
    subtitle: 'Welcome content block with optional CTA and image.',
    defaultSortOrder: 3,
  },
  {
    type: 'stats',
    label: 'Stats Section',
    subtitle: 'Key metrics (value + label pairs).',
    defaultSortOrder: 4,
  },
  {
    type: 'featured',
    label: 'Featured Experience',
    subtitle: 'Featured property block with highlights list and image.',
    defaultSortOrder: 5,
  },
  {
    type: 'leadership',
    label: 'Leadership Quote',
    subtitle: 'Leadership statement and profile image.',
    defaultSortOrder: 6,
  },
  {
    type: 'news',
    label: 'News Feed',
    subtitle: 'Latest updates cards with date, title, and description.',
    defaultSortOrder: 7,
  },
  {
    type: 'accolades',
    label: 'Accolades',
    subtitle: 'Awards and recognitions list.',
    defaultSortOrder: 8,
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    subtitle: 'Newsletter heading and supporting text.',
    defaultSortOrder: 9,
  },
];

function formatSectionLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function dateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusToneClass(status: string) {
  const value = status.toUpperCase();
  if (['HIRED', 'RESOLVED', 'COMPLETED'].includes(value)) return 'status-success';
  if (['REJECTED', 'ARCHIVED', 'DELETE'].includes(value)) return 'status-danger';
  if (['NEW', 'IN_PROGRESS', 'REVIEWING'].includes(value)) return 'status-warning';
  return 'status-info';
}

function actionToneClass(action: string) {
  const value = action.toUpperCase();
  if (value === 'CREATE') return 'status-success';
  if (value === 'DELETE') return 'status-danger';
  if (value === 'LOGIN') return 'status-info';
  return 'status-warning';
}

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim()) {
      query.set(key, value.trim());
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

function GenericListManager<T extends { id: string }>({
  title,
  subtitle,
  endpoint,
  defaults,
  renderFields,
  toPayload,
  summary,
  entityLabel = 'Item',
  onFeedback,
  isUploadBusy = false,
}: {
  title: string;
  subtitle?: string;
  endpoint: string;
  defaults: Record<string, unknown>;
  renderFields: (
    form: Record<string, unknown>,
    setForm: Dispatch<SetStateAction<Record<string, unknown>>>,
  ) => ReactNode;
  toPayload: (form: Record<string, unknown>) => Record<string, unknown>;
  summary: (item: T) => ReactNode;
  entityLabel?: string;
  onFeedback?: (type: 'success' | 'error', message: string) => void;
  isUploadBusy?: boolean;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [form, setForm] = useState<Record<string, unknown>>(defaults);
  const [editId, setEditId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await apiRequest<T[]>(endpoint);
      setItems(data);
      if (data.length === 0) {
        setIsFormOpen(true);
      }
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isUploadBusy) {
      onFeedback?.('error', 'Please wait for image upload to finish.');
      return;
    }
    const payload = toPayload(form);

    try {
      if (editId) {
        await apiRequest(`${endpoint}/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setForm(defaults);
      setEditId(null);
      setIsFormOpen(false);
      onFeedback?.(
        'success',
        `${entityLabel} ${editId ? 'updated' : 'added'} successfully.`,
      );
      await load();
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      onFeedback?.('error', message);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this item?')) return;

    try {
      await apiRequest(`${endpoint}/${id}`, { method: 'DELETE' });
      onFeedback?.('success', `${entityLabel} deleted successfully.`);
      await load();
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      onFeedback?.('error', message);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-section-head split">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            if (isFormOpen && !editId) {
              setIsFormOpen(false);
              return;
            }
            setForm(defaults);
            setEditId(null);
            setIsFormOpen(true);
          }}
        >
          {isFormOpen && !editId ? 'Close Form' : `Add New ${entityLabel}`}
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {isFormOpen && (
        <form className="admin-form admin-form-panel" onSubmit={handleSubmit}>
          {renderFields(form, setForm)}
          <div className="admin-form-actions">
            <button type="submit" className="btn-primary" disabled={isUploadBusy}>
              {isUploadBusy ? 'Uploading image...' : editId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditId(null);
                setForm(defaults);
                setIsFormOpen(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="admin-empty">Loading...</p>
      ) : items.length === 0 ? (
        <p className="admin-empty">No items yet.</p>
      ) : (
        <div className="admin-list">
          {items.map((item) => (
            <article key={item.id} className="admin-list-item">
              <div className="admin-item-main">{summary(item)}</div>
              <div className="admin-item-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditId(item.id);
                    setForm(item as unknown as Record<string, unknown>);
                    setIsFormOpen(true);
                  }}
                >
                  Edit
                </button>
                <button type="button" className="btn-danger" onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write details here...',
}: {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!hostRef.current || quillRef.current) return;

    const editorElement = document.createElement('div');
    hostRef.current.innerHTML = '';
    hostRef.current.appendChild(editorElement);

    const quill = new Quill(editorElement, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
          ['clean'],
        ],
      },
    });

    const handleTextChange = () => {
      const html = quill.root.innerHTML;
      const normalized = html === '<p><br></p>' ? '' : html;
      onChangeRef.current(normalized);
    };

    quill.on('text-change', handleTextChange);
    quillRef.current = quill;

    return () => {
      quill.off('text-change', handleTextChange);
      quillRef.current = null;
    };
  }, [placeholder]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    const currentHtml = quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML;
    const nextHtml = value || '';

    if (currentHtml !== nextHtml) {
      quill.root.innerHTML = nextHtml || '<p><br></p>';
    }
  }, [value]);

  return <div className="admin-richtext-host" ref={hostRef} />;
}

function getHomeBlockFormDefaults() {
  return {
    heading: '',
    subheading: '',
    description: '',
    ctaText: '',
    ctaUrl: '',
    imageAssetId: '',
    imageUrl: '',
    isVisible: true,
    pillarItems: [{ icon: 'Users', title: '', desc: '' }],
    statItems: [{ value: '', label: '' }],
    featureItems: [''],
    newsItems: [{ date: '', title: '', desc: '' }],
    accoladeItems: [{ title: '', desc: '' }],
  } as Record<string, unknown>;
}

function asObject(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asText(value: unknown) {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
}

function readObjectItems<T>(
  value: unknown,
  mapFn: (item: Record<string, unknown>) => T,
  fallback: T[],
) {
  if (!Array.isArray(value)) return fallback;
  const mapped = value
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => mapFn(item as Record<string, unknown>));
  return mapped.length > 0 ? mapped : fallback;
}

function readStringItems(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const mapped = value.map((item) => asText(item));
  return mapped.length > 0 ? mapped : fallback;
}

function getHomeBlockFormFromItem(item: HomeBlock) {
  const payload = asObject(item.payload);
  return {
    ...getHomeBlockFormDefaults(),
    heading: item.heading || '',
    subheading: item.subheading || '',
    description: item.description || '',
    ctaText: item.ctaText || '',
    ctaUrl: item.ctaUrl || '',
    imageAssetId: item.imageAssetId || '',
    imageUrl: asText(payload.imageUrl),
    isVisible: item.isVisible,
    pillarItems: readObjectItems(
      payload.items,
      (row) => ({
        icon: asText(row.icon),
        title: asText(row.title),
        desc: asText(row.desc),
      }),
      [{ icon: 'Users', title: '', desc: '' }],
    ),
    statItems: readObjectItems(
      payload.items,
      (row) => ({
        value: asText(row.value),
        label: asText(row.label),
      }),
      [{ value: '', label: '' }],
    ),
    featureItems: readStringItems(payload.features, ['']),
    newsItems: readObjectItems(
      payload.items,
      (row) => ({
        date: asText(row.date),
        title: asText(row.title),
        desc: asText(row.desc),
      }),
      [{ date: '', title: '', desc: '' }],
    ),
    accoladeItems: readObjectItems(
      payload.items,
      (row) => ({
        title: asText(row.title),
        desc: asText(row.desc),
      }),
      [{ title: '', desc: '' }],
    ),
  } as Record<string, unknown>;
}

function HomeBlockSectionManager({
  config,
  onFeedback,
  uploadForField,
}: {
  config: HomeBlockSectionConfig;
  onFeedback?: (type: 'success' | 'error', message: string) => void;
  uploadForField: (
    setter: Dispatch<SetStateAction<Record<string, unknown>>>,
    field: string,
    file: File | null,
  ) => Promise<void>;
}) {
  const endpoint = '/api/admin/home-blocks';
  const [items, setItems] = useState<HomeBlock[]>([]);
  const [form, setForm] = useState<Record<string, unknown>>(() => getHomeBlockFormDefaults());
  const [editId, setEditId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await apiRequest<HomeBlock[]>(endpoint);
      const filtered = data
        .filter((item) => item.type === config.type)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      setItems(filtered);
      if (filtered.length === 0) {
        setIsFormOpen(true);
      }
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.type]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const clean = (value: unknown) => String(value || '').trim();
    const imageAssetId = clean(form.imageAssetId);
    const imageUrl = clean(form.imageUrl);
    const pillarItems = (Array.isArray(form.pillarItems) ? form.pillarItems : [])
      .map((row) => asObject(row))
      .map((row) => ({
        icon: clean(row.icon),
        title: clean(row.title),
        desc: clean(row.desc),
      }))
      .filter((row) => row.title || row.desc || row.icon);
    const statItems = (Array.isArray(form.statItems) ? form.statItems : [])
      .map((row) => asObject(row))
      .map((row) => ({
        value: clean(row.value),
        label: clean(row.label),
      }))
      .filter((row) => row.value || row.label);
    const featureItems = (Array.isArray(form.featureItems) ? form.featureItems : [])
      .map((item) => clean(item))
      .filter(Boolean);
    const newsItems = (Array.isArray(form.newsItems) ? form.newsItems : [])
      .map((row) => asObject(row))
      .map((row) => ({
        date: clean(row.date),
        title: clean(row.title),
        desc: clean(row.desc),
      }))
      .filter((row) => row.date || row.title || row.desc);
    const accoladeItems = (Array.isArray(form.accoladeItems) ? form.accoladeItems : [])
      .map((row) => asObject(row))
      .map((row) => ({
        title: clean(row.title),
        desc: clean(row.desc),
      }))
      .filter((row) => row.title || row.desc);

    const payloadBody: Record<string, unknown> = {};

    if (['hero', 'intro', 'featured', 'leadership'].includes(config.type) && imageUrl) {
      payloadBody.imageUrl = imageUrl;
    }

    if (config.type === 'pillars') {
      payloadBody.items = pillarItems;
    }

    if (config.type === 'stats') {
      payloadBody.items = statItems;
    }

    if (config.type === 'featured') {
      payloadBody.features = featureItems;
    }

    if (config.type === 'news') {
      payloadBody.items = newsItems;
    }

    if (config.type === 'accolades') {
      payloadBody.items = accoladeItems;
    }

    const lockedSortOrder = editId
      ? items.find((item) => item.id === editId)?.sortOrder ?? config.defaultSortOrder
      : config.defaultSortOrder;

    if (showImageFields && !imageAssetId) {
      const message = `Image Asset ID is required for ${config.label}. Please upload/select an image before saving.`;
      setError(message);
      onFeedback?.('error', message);
      return;
    }

    const payload = {
      type: config.type,
      heading: clean(form.heading) || null,
      subheading: clean(form.subheading) || null,
      description: clean(form.description) || null,
      ctaText: clean(form.ctaText) || null,
      ctaUrl: clean(form.ctaUrl) || null,
      payload: Object.keys(payloadBody).length > 0 ? payloadBody : null,
      imageAssetId: imageAssetId || null,
      sortOrder: lockedSortOrder,
      isVisible: Boolean(form.isVisible),
    };

    try {
      if (editId) {
        await apiRequest(`${endpoint}/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setForm(getHomeBlockFormDefaults());
      setEditId(null);
      setIsFormOpen(false);
      onFeedback?.('success', `${config.label} ${editId ? 'updated' : 'added'} successfully.`);
      await load();
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      onFeedback?.('error', message);
    }
  }

  const showSubheading = ['pillars', 'intro', 'featured'].includes(config.type);
  const showDescription = ['hero', 'intro', 'featured', 'leadership', 'newsletter'].includes(
    config.type,
  );
  const showCta = ['hero', 'intro', 'featured'].includes(config.type);
  const showImageFields = ['hero', 'intro', 'featured', 'leadership'].includes(config.type);
  const showHeading = config.type !== 'stats';
  const showPillars = config.type === 'pillars';
  const showStats = config.type === 'stats';
  const showFeatures = config.type === 'featured';
  const showNews = config.type === 'news';
  const showAccolades = config.type === 'accolades';

  const pillarItems = Array.isArray(form.pillarItems)
    ? (form.pillarItems as Array<Record<string, unknown>>)
    : [];
  const statItems = Array.isArray(form.statItems) ? (form.statItems as Array<Record<string, unknown>>) : [];
  const featureItems = Array.isArray(form.featureItems) ? (form.featureItems as string[]) : [];
  const newsItems = Array.isArray(form.newsItems) ? (form.newsItems as Array<Record<string, unknown>>) : [];
  const accoladeItems = Array.isArray(form.accoladeItems)
    ? (form.accoladeItems as Array<Record<string, unknown>>)
    : [];

  return (
    <section className="admin-subsection admin-home-subsection">
      <div className="admin-section-head">
        <div>
          <h3>{config.label}</h3>
          <p>{config.subtitle}</p>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {isFormOpen && (
        <form className="admin-form admin-form-panel" onSubmit={handleSubmit}>
          {showHeading && (
            <label>
              <span>Heading</span>
              <input
                placeholder="Heading"
                value={String(form.heading || '')}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, heading: e.target.value }))
                }
              />
            </label>
          )}

          {showSubheading && (
            <label>
              <span>Subheading</span>
              <input
                placeholder="Subheading"
                value={String(form.subheading || '')}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, subheading: e.target.value }))
                }
              />
            </label>
          )}

          {showDescription && (
            <label>
              <span>{config.type === 'leadership' ? 'Author / Line' : 'Description'}</span>
              <textarea
                placeholder="Description"
                value={String(form.description || '')}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </label>
          )}

          {showCta && (
            <div className="admin-form-grid two">
              <label>
                <span>CTA Text</span>
                <input
                  placeholder="Explore"
                  value={String(form.ctaText || '')}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, ctaText: e.target.value }))
                  }
                />
              </label>
              <label>
                <span>CTA URL</span>
                <input
                  placeholder="/portfolio"
                  value={String(form.ctaUrl || '')}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, ctaUrl: e.target.value }))
                  }
                />
              </label>
            </div>
          )}

          {showImageFields && (
            <>
              <div className="inline-group">
                <label>
                  <span>Image Asset ID</span>
                  <input
                    placeholder="Asset ID"
                    value={String(form.imageAssetId || '')}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, imageAssetId: e.target.value }))
                    }
                  />
                </label>
                <label>
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) =>
                      uploadForField(
                        setForm,
                        'imageAssetId',
                        e.target.files?.[0] || null,
                      )
                    }
                  />
                </label>
              </div>
              <label>
                <span>Fallback Image URL (optional)</span>
                <input
                  placeholder="/hero-bg.png"
                  value={String(form.imageUrl || '')}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                />
              </label>
            </>
          )}

          {showPillars && (
            <div className="admin-repeater">
              <div className="admin-repeater-head">
                <span>Pillar Cards</span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      pillarItems: [
                        ...(Array.isArray(prev.pillarItems) ? prev.pillarItems : []),
                        { icon: 'Users', title: '', desc: '' },
                      ],
                    }))
                  }
                >
                  Add Pillar
                </button>
              </div>
              {pillarItems.map((row, index) => (
                <div key={`pillar-${index}`} className="admin-repeater-item">
                  <div className="admin-repeater-item-head">
                    <strong>Pillar {index + 1}</strong>
                  </div>
                  <div className="admin-form-grid two">
                    <label>
                      <span>Icon Key</span>
                      <input
                        placeholder="Users"
                        value={asText(row.icon)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            pillarItems: pillarItems.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, icon: e.target.value } : item,
                            ),
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>Title</span>
                      <input
                        placeholder="Investment"
                        value={asText(row.title)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            pillarItems: pillarItems.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, title: e.target.value } : item,
                            ),
                          }))
                        }
                      />
                    </label>
                  </div>
                  <label>
                    <span>Description</span>
                    <textarea
                      placeholder="Card description"
                      value={asText(row.desc)}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          pillarItems: pillarItems.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, desc: e.target.value } : item,
                          ),
                        }))
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          )}

          {showStats && (
            <div className="admin-repeater">
              <div className="admin-repeater-head">
                <span>Stat Items</span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      statItems: [
                        ...(Array.isArray(prev.statItems) ? prev.statItems : []),
                        { value: '', label: '' },
                      ],
                    }))
                  }
                >
                  Add Stat
                </button>
              </div>
              {statItems.map((row, index) => (
                <div key={`stat-${index}`} className="admin-repeater-item">
                  <div className="admin-repeater-item-head">
                    <strong>Stat {index + 1}</strong>
                  </div>
                  <div className="admin-form-grid two">
                    <label>
                      <span>Value</span>
                      <input
                        placeholder="12"
                        value={asText(row.value)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            statItems: statItems.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, value: e.target.value } : item,
                            ),
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>Label</span>
                      <input
                        placeholder="Hotels"
                        value={asText(row.label)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            statItems: statItems.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, label: e.target.value } : item,
                            ),
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showFeatures && (
            <div className="admin-repeater">
              <div className="admin-repeater-head">
                <span>Feature List</span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      featureItems: [...(Array.isArray(prev.featureItems) ? prev.featureItems : []), ''],
                    }))
                  }
                >
                  Add Feature
                </button>
              </div>
              {featureItems.map((feature, index) => (
                <div key={`feature-${index}`} className="admin-repeater-item">
                  <div className="admin-repeater-item-head">
                    <strong>Feature {index + 1}</strong>
                  </div>
                  <label>
                    <span>Feature Text</span>
                    <input
                      placeholder="Panoramic City Views"
                      value={feature}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          featureItems: featureItems.map((item, itemIndex) =>
                            itemIndex === index ? e.target.value : item,
                          ),
                        }))
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          )}

          {showNews && (
            <div className="admin-repeater">
              <div className="admin-repeater-head">
                <span>News Items</span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      newsItems: [
                        ...(Array.isArray(prev.newsItems) ? prev.newsItems : []),
                        { date: '', title: '', desc: '' },
                      ],
                    }))
                  }
                >
                  Add News
                </button>
              </div>
              {newsItems.map((row, index) => (
                <div key={`news-${index}`} className="admin-repeater-item">
                  <div className="admin-repeater-item-head">
                    <strong>News {index + 1}</strong>
                  </div>
                  <div className="admin-form-grid two">
                    <label>
                      <span>Date</span>
                      <input
                        placeholder="Oct 24, 2026"
                        value={asText(row.date)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            newsItems: newsItems.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, date: e.target.value } : item,
                            ),
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>Title</span>
                      <input
                        placeholder="News title"
                        value={asText(row.title)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            newsItems: newsItems.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, title: e.target.value } : item,
                            ),
                          }))
                        }
                      />
                    </label>
                  </div>
                  <label>
                    <span>Description</span>
                    <textarea
                      placeholder="News summary"
                      value={asText(row.desc)}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          newsItems: newsItems.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, desc: e.target.value } : item,
                          ),
                        }))
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          )}

          {showAccolades && (
            <div className="admin-repeater">
              <div className="admin-repeater-head">
                <span>Accolade Items</span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      accoladeItems: [
                        ...(Array.isArray(prev.accoladeItems) ? prev.accoladeItems : []),
                        { title: '', desc: '' },
                      ],
                    }))
                  }
                >
                  Add Accolade
                </button>
              </div>
              {accoladeItems.map((row, index) => (
                <div key={`accolade-${index}`} className="admin-repeater-item">
                  <div className="admin-repeater-item-head">
                    <strong>Accolade {index + 1}</strong>
                  </div>
                  <div className="admin-form-grid two">
                    <label>
                      <span>Title</span>
                      <input
                        placeholder="Award title"
                        value={asText(row.title)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            accoladeItems: accoladeItems.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, title: e.target.value } : item,
                            ),
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>Description</span>
                      <input
                        placeholder="Award details"
                        value={asText(row.desc)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            accoladeItems: accoladeItems.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, desc: e.target.value } : item,
                            ),
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="inline-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={Boolean(form.isVisible)}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isVisible: e.target.checked }))
                }
              />
              <span>Visible</span>
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn-primary">
              {editId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditId(null);
                setForm(getHomeBlockFormDefaults());
                setIsFormOpen(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="admin-empty">Loading...</p>
      ) : items.length === 0 ? (
        <p className="admin-empty">No items yet for this section.</p>
      ) : (
        <div className="admin-list">
          {items.map((item) => (
            <article key={item.id} className="admin-list-item">
              <div className="admin-item-main">
                <h3>{item.heading || config.label}</h3>
                <p className="admin-item-meta">
                  {item.isVisible ? 'Visible' : 'Hidden'}
                </p>
              </div>
              <div className="admin-item-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditId(item.id);
                    setForm(getHomeBlockFormFromItem(item));
                    setIsFormOpen(true);
                  }}
                >
                  Edit
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const AdminPanel = () => {
  const [token, setToken] = useState<string | null>(getAdminToken());
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [tab, setTab] = useState<AdminTabKey>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState<AdminNotice | null>(null);
  const [uploadingFieldCount, setUploadingFieldCount] = useState(0);
  const toastTimeoutRef = useRef<number | null>(null);

  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [dashboardFrom, setDashboardFrom] = useState(() => dateValue(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)));
  const [dashboardTo, setDashboardTo] = useState(() => dateValue(new Date()));

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdmin, setNewAdmin] = useState({ fullName: '', email: '', password: '' });
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    profileImageAssetId: '',
    profileImagePreviewUrl: '/logo.jpg',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityAdminId, setActivityAdminId] = useState('ALL');
  const [activityAction, setActivityAction] = useState('ALL');

  const [brands, setBrands] = useState<HotelBrand[]>([]);
  const [properties, setProperties] = useState<PortfolioProperty[]>([]);

  const [states, setStates] = useState<UsState[]>([]);
  const [cities, setCities] = useState<UsCity[]>([]);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

  const [propertyForm, setPropertyForm] = useState<PropertyFormState>(emptyPropertyForm);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [selectedPropertyIdForGallery, setSelectedPropertyIdForGallery] = useState<string | null>(null);
  const [propertyError, setPropertyError] = useState<string | null>(null);

  const [contactForm, setContactForm] = useState({
    heading: 'Contact Us',
    introText: '',
    address: '',
    investmentEmail: '',
    investmentPhone: '',
    generalEmail: '',
    generalPhone: '',
  });
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactMessages, setContactMessages] = useState<ContactMessageEntry[]>([]);
  const [contactMessageStatusFilter, setContactMessageStatusFilter] = useState<'ALL' | ContactMessageStatus>('ALL');

  const [careerApplications, setCareerApplications] = useState<CareerApplicationEntry[]>([]);
  const [careerOpportunities, setCareerOpportunities] = useState<CareerOpportunityEntry[]>([]);
  const [careerStatusFilter, setCareerStatusFilter] = useState<'ALL' | CareerApplicationStatus>('ALL');
  const [careerJobFilter, setCareerJobFilter] = useState<'ALL' | string>('ALL');
  const [moderationModal, setModerationModal] = useState<ModerationModalState | null>(null);
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  const [siteForm, setSiteForm] = useState({
    brandName: 'JSR Hotels',
    footerTagline: '',
    logoAssetId: '',
    logoPreviewUrl: '/logo.jpg',
  });
  const [isSiteFormOpen, setIsSiteFormOpen] = useState(false);
  const [loginHeroImageUrl, setLoginHeroImageUrl] = useState('/hero-bg.png');

  const [legalDocs, setLegalDocs] = useState(defaultLegalDocs);
  const [activeLegalDocType, setActiveLegalDocType] = useState<'PRIVACY' | 'TERMS' | null>(null);

  const selectedProperty = useMemo(
    () => properties.find((item) => item.id === selectedPropertyIdForGallery) || null,
    [properties, selectedPropertyIdForGallery],
  );

  const activeTab =
    tab === 'profile'
      ? profileTabMeta
      : tabItems.find((item) => item.key === tab) || tabItems[0];
  const ActiveIcon = activeTab.icon;
  const brandDisplayName = siteForm.brandName || 'JSR Hotels';
  const sidebarAvatarSrc = currentAdmin?.profileImageAsset?.url
    ? resolveAssetUrl(currentAdmin.profileImageAsset.url)
    : siteForm.logoPreviewUrl || '/logo.jpg';

  function pushNotice(type: AdminNotice['type'], message: string) {
    const clean = String(message || '').replace(/\s+/g, ' ').trim();
    const short = clean.length > 110 ? `${clean.slice(0, 107)}...` : clean;
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast({ type, message: short || 'Action completed.' });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3200);
  }

  function dismissToast() {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast(null);
  }

  async function refreshAuthState() {
    try {
      const data = await apiRequest<{ admin: AdminUser }>('/api/admin/auth/me');
      setCurrentAdmin(data.admin);
      setAuthError(null);
    } catch (err) {
      setCurrentAdmin(null);
      setAuthError((err as Error).message);
      setAdminToken(null);
      setToken(null);
    }
  }

  async function loadAdminDashboard() {
    const query = buildQuery({ from: dashboardFrom, to: dashboardTo });
    const dashboardData = await apiRequest<DashboardPayload>(`/api/admin/dashboard${query}`);
    setDashboard(dashboardData);
  }

  async function loadAdmins() {
    const adminsData = await apiRequest<AdminUser[]>('/api/admin/admins');
    setAdmins(adminsData);
    if (adminsData.length === 0) {
      setIsAdminFormOpen(true);
    }
  }

  async function loadProfile() {
    const profile = await apiRequest<AdminUser>('/api/admin/profile');
    setProfileForm({
      fullName: profile.fullName || '',
      email: profile.email || '',
      profileImageAssetId: profile.profileImageAssetId || '',
      profileImagePreviewUrl: profile.profileImageAsset?.url
        ? resolveAssetUrl(profile.profileImageAsset.url)
        : '/logo.jpg',
    });
    setCurrentAdmin(profile);
  }

  async function loadActivityLogs() {
    const query = buildQuery({
      adminId: activityAdminId === 'ALL' ? undefined : activityAdminId,
      action: activityAction === 'ALL' ? undefined : activityAction,
    });
    const logsData = await apiRequest<ActivityLog[]>(`/api/admin/activity-logs${query}`);
    setActivityLogs(logsData);
  }

  async function loadPropertyData() {
    const [brandsData, propertiesData, statesData] = await Promise.all([
      apiRequest<HotelBrand[]>('/api/admin/hotel-brands'),
      apiRequest<PortfolioProperty[]>('/api/admin/portfolio-properties'),
      apiRequest<UsState[]>('/api/public/us/states'),
    ]);

    setBrands(brandsData);
    setProperties(propertiesData);
    setStates(statesData);
    if (propertiesData.length === 0) {
      setIsPropertyFormOpen(true);
    }
  }

  async function loadCitiesByState(stateCode: string) {
    const data = await apiRequest<UsCity[]>(`/api/public/us/cities?state=${stateCode}`);
    setCities(data);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const email = normalizeEmail(loginEmail);
    if (!isValidEmail(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    try {
      const data = await apiRequest<{ token: string; admin: AdminUser }>('/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: loginPassword }),
      });
      setAdminToken(data.token);
      setToken(data.token);
      setCurrentAdmin(data.admin);
      setAuthError(null);
    } catch (err) {
      setAuthError((err as Error).message);
    }
  }

  function handleLogout() {
    setAdminToken(null);
    setToken(null);
    setCurrentAdmin(null);
  }

  async function handleAdminCreate(e: FormEvent) {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(newAdmin.email);

    if (!isValidEmail(normalizedEmail)) {
      pushNotice('error', 'Please enter a valid email address for the new admin.');
      return;
    }

    if (!isStrongPassword(newAdmin.password)) {
      pushNotice('error', 'Password must be 8+ characters and include letters and numbers.');
      return;
    }

    try {
      await apiRequest('/api/admin/admins', {
        method: 'POST',
        body: JSON.stringify({
          ...newAdmin,
          email: normalizedEmail,
          fullName: String(newAdmin.fullName || '').trim(),
        }),
      });

      setNewAdmin({ fullName: '', email: '', password: '' });
      setIsAdminFormOpen(false);
      pushNotice('success', 'Admin added successfully.');
      await Promise.all([loadAdmins(), loadActivityLogs()]);
    } catch (err) {
      const message = (err as Error).message;
      pushNotice('error', message);
    }
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();

    const fullName = String(profileForm.fullName || '').trim();

    if (!fullName) {
      pushNotice('error', 'Full name is required.');
      return;
    }

    try {
      const updated = await apiRequest<AdminUser>('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName,
          profileImageAssetId: profileForm.profileImageAssetId || null,
        }),
      });

      setCurrentAdmin(updated);
      setProfileForm((prev) => ({
        ...prev,
        fullName: updated.fullName || '',
        email: updated.email || '',
        profileImageAssetId: updated.profileImageAssetId || '',
        profileImagePreviewUrl: updated.profileImageAsset?.url
          ? resolveAssetUrl(updated.profileImageAsset.url)
          : prev.profileImagePreviewUrl,
      }));
      setIsProfileFormOpen(false);
      pushNotice('success', 'Profile updated successfully.');
      await Promise.all([loadAdmins(), loadActivityLogs()]);
    } catch (err) {
      pushNotice('error', (err as Error).message);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      pushNotice('error', 'All password fields are required.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      pushNotice('error', 'New password and confirm password must match.');
      return;
    }

    if (!isStrongPassword(passwordForm.newPassword)) {
      pushNotice('error', 'New password must be 8+ characters and include letters and numbers.');
      return;
    }

    try {
      await apiRequest('/api/admin/profile/password', {
        method: 'PUT',
        body: JSON.stringify(passwordForm),
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordFormOpen(false);
      pushNotice('success', 'Password changed successfully.');
      await loadActivityLogs();
    } catch (err) {
      pushNotice('error', (err as Error).message);
    }
  }

  async function uploadProfileImage(file: File | null) {
    if (!file) return;
    setUploadingFieldCount((prev) => prev + 1);
    try {
      const asset = await uploadFile(file);
      setProfileForm((prev) => ({
        ...prev,
        profileImageAssetId: String(asset.id || ''),
        profileImagePreviewUrl: resolveAssetUrl(String(asset.url || '')),
      }));
      pushNotice('success', 'Profile image uploaded successfully.');
    } catch (err) {
      pushNotice('error', (err as Error).message);
    } finally {
      setUploadingFieldCount((prev) => Math.max(0, prev - 1));
    }
  }

  async function handleAdminDelete(id: string) {
    try {
      await apiRequest(`/api/admin/admins/${id}`, { method: 'DELETE' });
      pushNotice('success', 'Admin removed successfully.');
      await Promise.all([loadAdmins(), loadActivityLogs()]);
    } catch (err) {
      const message = (err as Error).message;
      pushNotice('error', message);
    }
  }

  async function handlePropertySubmit(e: FormEvent) {
    e.preventDefault();
    setPropertyError(null);

    try {
      const payload: Record<string, unknown> = {
        ...propertyForm,
        keyInfo: String(propertyForm.keyInfoText || '').trim()
          ? { html: String(propertyForm.keyInfoText) }
          : null,
      };

      delete payload.keyInfoText;

      if (editingPropertyId) {
        await apiRequest(`/api/admin/portfolio-properties/${editingPropertyId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/api/admin/portfolio-properties', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setEditingPropertyId(null);
      setIsPropertyFormOpen(false);
      setPropertyForm(emptyPropertyForm);
      pushNotice('success', `Property ${editingPropertyId ? 'updated' : 'created'} successfully.`);
      await Promise.all([loadPropertyData(), loadActivityLogs()]);
    } catch (err) {
      const message = (err as Error).message;
      setPropertyError(message);
      pushNotice('error', message);
    }
  }

  async function handlePropertyDelete(id: string) {
    if (!window.confirm('Delete this property?')) return;

    try {
      await apiRequest(`/api/admin/portfolio-properties/${id}`, { method: 'DELETE' });
      pushNotice('success', 'Property deleted successfully.');
      await Promise.all([loadPropertyData(), loadActivityLogs()]);
      if (selectedPropertyIdForGallery === id) {
        setSelectedPropertyIdForGallery(null);
      }
    } catch (err) {
      const message = (err as Error).message;
      setPropertyError(message);
      pushNotice('error', message);
    }
  }

  async function uploadAndSetCover(file: File | null) {
    if (!file) return;
    try {
      const asset = await uploadFile(file);
      setPropertyForm((prev) => ({ ...prev, coverImageAssetId: asset.id }));
      pushNotice('success', 'Cover image uploaded successfully.');
    } catch (err) {
      pushNotice('error', (err as Error).message);
    }
  }

  async function uploadGalleryImages(files: FileList | null) {
    if (!files || !selectedProperty) return;

    try {
      const existingCount = selectedProperty.images?.length || 0;

      for (const [index, file] of Array.from(files).entries()) {
        const asset = await uploadFile(file);
        await apiRequest(`/api/admin/portfolio-properties/${selectedProperty.id}/images`, {
          method: 'POST',
          body: JSON.stringify({
            assetId: asset.id,
            altText: selectedProperty.title,
            sortOrder: existingCount + index,
            isCover: existingCount === 0 && index === 0,
          }),
        });
      }

      pushNotice('success', 'Gallery image(s) uploaded successfully.');
      await Promise.all([loadPropertyData(), loadActivityLogs()]);
    } catch (err) {
      pushNotice('error', (err as Error).message);
      setPropertyError((err as Error).message);
    }
  }

  async function setGalleryCover(propertyImageId: string) {
    try {
      await apiRequest(`/api/admin/property-images/${propertyImageId}`, {
        method: 'PUT',
        body: JSON.stringify({ isCover: true }),
      });
      pushNotice('success', 'Cover image updated successfully.');
      await Promise.all([loadPropertyData(), loadActivityLogs()]);
    } catch (err) {
      pushNotice('error', (err as Error).message);
      setPropertyError((err as Error).message);
    }
  }

  async function deleteGalleryImage(propertyImageId: string) {
    try {
      await apiRequest(`/api/admin/property-images/${propertyImageId}`, { method: 'DELETE' });
      pushNotice('success', 'Gallery image deleted successfully.');
      await Promise.all([loadPropertyData(), loadActivityLogs()]);
    } catch (err) {
      pushNotice('error', (err as Error).message);
      setPropertyError((err as Error).message);
    }
  }

  async function addressSearch(query: string) {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const data = await apiRequest<AddressSuggestion[]>(
      `/api/public/address-search?q=${encodeURIComponent(query)}`,
    );
    setSuggestions(data);
  }

  function applyAddressSuggestion(item: AddressSuggestion) {
    const house = item.address?.house_number || '';
    const road = item.address?.road || '';
    const line1 = `${house} ${road}`.trim();
    const city = item.address?.city || item.address?.town || item.address?.village || '';
    const stateName = item.address?.state || '';
    const zipCode = item.address?.postcode || '';

    const matchingState = states.find(
      (state) => state.name.toLowerCase() === stateName.toLowerCase(),
    );

    setPropertyForm((prev) => ({
      ...prev,
      addressLine1: line1 || prev.addressLine1,
      city: city || prev.city,
      state: matchingState?.code || prev.state,
      zipCode: zipCode || prev.zipCode,
      country: 'USA',
    }));

    setSuggestions([]);
  }

  async function loadContact() {
    const contact = await apiRequest<{
      heading: string;
      introText: string;
      address: string;
      investmentEmail?: string;
      investmentPhone?: string;
      generalEmail: string;
      generalPhone: string;
    }>('/api/admin/contact-info');

    if (contact) {
      setContactForm({
        heading: contact.heading || 'Contact Us',
        introText: contact.introText || '',
        address: contact.address || '',
        investmentEmail: contact.investmentEmail || '',
        investmentPhone: contact.investmentPhone || '',
        generalEmail: contact.generalEmail || '',
        generalPhone: contact.generalPhone || '',
      });
    }
  }

  async function saveContact(e: FormEvent) {
    e.preventDefault();
    const generalEmail = normalizeEmail(contactForm.generalEmail);
    const investmentEmail = normalizeEmail(contactForm.investmentEmail);

    if (!isValidEmail(generalEmail)) {
      pushNotice('error', 'Please enter a valid general email address.');
      return;
    }

    if (!isValidUsPhone(contactForm.generalPhone)) {
      pushNotice('error', 'Please enter a valid general phone number.');
      return;
    }

    if (contactForm.investmentEmail && !isValidEmail(investmentEmail)) {
      pushNotice('error', 'Please enter a valid investment email address.');
      return;
    }

    if (contactForm.investmentPhone && !isValidUsPhone(contactForm.investmentPhone)) {
      pushNotice('error', 'Please enter a valid investment phone number.');
      return;
    }

    try {
      await apiRequest('/api/admin/contact-info', {
        method: 'PUT',
        body: JSON.stringify({
          ...contactForm,
          generalEmail,
          investmentEmail: contactForm.investmentEmail ? investmentEmail : '',
        }),
      });

      setIsContactFormOpen(false);
      pushNotice('success', 'Contact information updated successfully.');
      await Promise.all([loadContact(), loadActivityLogs()]);
    } catch (err) {
      pushNotice('error', (err as Error).message);
    }
  }

  async function loadContactMessages() {
    const query = buildQuery({
      status: contactMessageStatusFilter === 'ALL' ? undefined : contactMessageStatusFilter,
    });
    const messages = await apiRequest<ContactMessageEntry[]>(`/api/admin/contact-messages${query}`);
    setContactMessages(messages);
  }

  async function updateContactMessage(
    id: string,
    payload: { status: ContactMessageStatus; adminNotes: string },
  ) {
    try {
      await apiRequest(`/api/admin/contact-messages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      pushNotice('success', 'Contact message updated successfully.');
      await Promise.all([loadContactMessages(), loadActivityLogs()]);
      return true;
    } catch (err) {
      pushNotice('error', (err as Error).message);
      return false;
    }
  }

  async function deleteContactMessage(id: string) {
    if (!window.confirm('Delete this contact message?')) return;

    try {
      await apiRequest(`/api/admin/contact-messages/${id}`, { method: 'DELETE' });
      pushNotice('success', 'Contact message deleted from inbox.');
      await Promise.all([loadContactMessages(), loadActivityLogs()]);
      return true;
    } catch (err) {
      pushNotice('error', (err as Error).message);
      return false;
    }
  }

  async function loadCareerOpportunities() {
    const opportunities = await apiRequest<CareerOpportunityEntry[]>('/api/admin/career-opportunities');
    setCareerOpportunities(opportunities);
  }

  async function loadCareerApplications() {
    const query = buildQuery({
      status: careerStatusFilter === 'ALL' ? undefined : careerStatusFilter,
      jobOpportunityId: careerJobFilter === 'ALL' ? undefined : careerJobFilter,
    });
    const applications = await apiRequest<CareerApplicationEntry[]>(`/api/admin/career-applications${query}`);
    setCareerApplications(applications);
  }

  async function updateCareerApplication(
    id: string,
    payload: { status: CareerApplicationStatus; adminNotes: string },
  ) {
    try {
      await apiRequest(`/api/admin/career-applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      pushNotice('success', 'Career application status updated.');
      await Promise.all([loadCareerApplications(), loadActivityLogs()]);
      return true;
    } catch (err) {
      pushNotice('error', (err as Error).message);
      return false;
    }
  }

  async function deleteCareerApplication(id: string) {
    if (!window.confirm('Delete this career application?')) return;

    try {
      await apiRequest(`/api/admin/career-applications/${id}`, { method: 'DELETE' });
      pushNotice('success', 'Career application deleted from inbox.');
      await Promise.all([loadCareerApplications(), loadActivityLogs()]);
      return true;
    } catch (err) {
      pushNotice('error', (err as Error).message);
      return false;
    }
  }

  function openContactMessageModal(item: ContactMessageEntry) {
    setModerationModal({
      kind: 'contact',
      id: item.id,
      title: item.fullName,
      subtitle: `${item.email}${item.phone ? ` | ${item.phone}` : ''}`,
      messageBody: item.message,
      status: item.status,
      adminNotes: item.adminNotes || '',
    });
  }

  function openCareerApplicationModal(item: CareerApplicationEntry) {
    const location = [item.city, item.state].filter(Boolean).join(', ');
    const roleTitle = item.jobOpportunity?.title || item.position;
    setModerationModal({
      kind: 'career',
      id: item.id,
      title: item.fullName,
      subtitle: `${roleTitle}${location ? ` | ${location}` : ''}`,
      messageBody: item.coverLetter || 'No cover letter provided.',
      status: item.status,
      adminNotes: item.adminNotes || '',
      resumeUrl: item.resumeUrl,
      resumeLabel: item.resumeOriginalName,
      resumeSize: item.resumeSize,
    });
  }

  async function handleModalSave() {
    if (!moderationModal) return;
    setIsModalSubmitting(true);
    try {
      if (moderationModal.kind === 'contact') {
        const ok = await updateContactMessage(moderationModal.id, {
          status: moderationModal.status,
          adminNotes: moderationModal.adminNotes,
        });
        if (ok) setModerationModal(null);
      } else {
        const ok = await updateCareerApplication(moderationModal.id, {
          status: moderationModal.status,
          adminNotes: moderationModal.adminNotes,
        });
        if (ok) setModerationModal(null);
      }
    } finally {
      setIsModalSubmitting(false);
    }
  }

  async function handleModalDelete() {
    if (!moderationModal) return;
    setIsModalSubmitting(true);
    try {
      const ok =
        moderationModal.kind === 'contact'
          ? await deleteContactMessage(moderationModal.id)
          : await deleteCareerApplication(moderationModal.id);
      if (ok) setModerationModal(null);
    } finally {
      setIsModalSubmitting(false);
    }
  }

  async function loadSiteSettings() {
    const setting = await apiRequest<{
      brandName: string;
      footerTagline?: string;
      logoAssetId?: string;
      logoAsset?: { url?: string };
    }>('/api/admin/site-settings');

    if (setting) {
      setSiteForm({
        brandName: setting.brandName || 'JSR Hotels',
        footerTagline: setting.footerTagline || '',
        logoAssetId: setting.logoAssetId || '',
        logoPreviewUrl: setting.logoAsset?.url
          ? resolveAssetUrl(setting.logoAsset.url)
          : '/logo.jpg',
      });
    }
  }

  async function saveSiteSettings(e: FormEvent) {
    e.preventDefault();

    try {
      await apiRequest('/api/admin/site-settings', {
        method: 'PUT',
        body: JSON.stringify({
          brandName: siteForm.brandName,
          footerTagline: siteForm.footerTagline,
          logoAssetId: siteForm.logoAssetId || null,
        }),
      });

      setIsSiteFormOpen(false);
      pushNotice('success', 'Site settings updated successfully.');
      await Promise.all([loadSiteSettings(), loadActivityLogs()]);
    } catch (err) {
      pushNotice('error', (err as Error).message);
    }
  }

  async function loadLegalDocs() {
    const docs = await apiRequest<
      Array<{ type: 'PRIVACY' | 'TERMS'; title: string; content: string }>
    >('/api/admin/legal-documents');

    const next = {
      PRIVACY: { ...defaultLegalDocs.PRIVACY },
      TERMS: { ...defaultLegalDocs.TERMS },
    };

    docs.forEach((doc) => {
      next[doc.type] = { title: doc.title, content: doc.content };
    });

    setLegalDocs(next);
  }

  async function saveLegalDoc(type: 'PRIVACY' | 'TERMS') {
    const doc = legalDocs[type];

    try {
      await apiRequest(`/api/admin/legal-documents/${type}`, {
        method: 'PUT',
        body: JSON.stringify(doc),
      });

      pushNotice('success', `${type === 'PRIVACY' ? 'Privacy Policy' : 'Terms & Conditions'} updated.`);
      await Promise.all([loadLegalDocs(), loadActivityLogs()]);
      return true;
    } catch (err) {
      pushNotice('error', (err as Error).message);
      return false;
    }
  }

  async function bootstrap() {
    await Promise.all([
      loadAdminDashboard(),
      loadProfile(),
      loadAdmins(),
      loadActivityLogs(),
      loadPropertyData(),
      loadContact(),
      loadContactMessages(),
      loadCareerOpportunities(),
      loadCareerApplications(),
      loadSiteSettings(),
      loadLegalDocs(),
    ]);
  }

  useEffect(() => {
    let cancelled = false;

    async function hydratePublicBranding() {
      try {
        const [siteSettings, homeBlocks] = await Promise.all([
          apiRequest<{ brandName?: string; logoAsset?: { url?: string } }>('/api/public/site-settings'),
          apiRequest<HomeBlock[]>('/api/public/home'),
        ]);

        if (!cancelled && siteSettings) {
          setSiteForm((prev) => ({
            ...prev,
            brandName: siteSettings.brandName || prev.brandName,
            logoPreviewUrl: siteSettings.logoAsset?.url
              ? resolveAssetUrl(siteSettings.logoAsset.url)
              : prev.logoPreviewUrl,
          }));
        }

        if (!cancelled && Array.isArray(homeBlocks)) {
          const hero = [...homeBlocks]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .find((block) => block.type === 'hero' && block.isVisible);

          if (hero?.imageAsset?.url) {
            setLoginHeroImageUrl(resolveAssetUrl(hero.imageAsset.url));
          } else {
            const payload = (hero?.payload || {}) as { imageUrl?: string };
            if (payload.imageUrl) {
              setLoginHeroImageUrl(payload.imageUrl);
            }
          }
        }
      } catch {
        // Login page keeps fallback logo and hero image if public data is unavailable.
      }
    }

    hydratePublicBranding();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    refreshAuthState().then(() => {
      bootstrap().catch((err) => pushNotice('error', (err as Error).message));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const activityEvents: Array<keyof WindowEventMap> = [
      'click',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
    ];
    let recentlyTouchedAt = 0;
    let timedOut = false;

    const markActivity = () => {
      const now = Date.now();
      if (now - recentlyTouchedAt < 10_000) return;
      recentlyTouchedAt = now;
      touchAdminSession();
    };

    const showTimeoutToast = () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
      setToast({
        type: 'info',
        message: 'Session timed out due to inactivity. Please sign in again.',
      });
      toastTimeoutRef.current = window.setTimeout(() => {
        setToast(null);
        toastTimeoutRef.current = null;
      }, 5000);
    };

    const endSession = () => {
      if (timedOut) return;
      timedOut = true;
      showTimeoutToast();
      setAdminToken(null);
      setToken(null);
      setCurrentAdmin(null);
      setTab('dashboard');
      setAuthError('Session expired due to inactivity. Please sign in again.');
    };

    const checkIdleTimeout = () => {
      const rawLastActivity = localStorage.getItem(ADMIN_LAST_ACTIVITY_KEY);
      const lastActivity = rawLastActivity ? Number(rawLastActivity) : NaN;
      if (!Number.isFinite(lastActivity)) {
        touchAdminSession();
        return;
      }
      if (Date.now() - lastActivity > ADMIN_IDLE_TIMEOUT_MS) {
        endSession();
      }
    };

    markActivity();
    for (const eventName of activityEvents) {
      window.addEventListener(eventName, markActivity, { passive: true });
    }

    const intervalId = window.setInterval(checkIdleTimeout, 15000);

    return () => {
      window.clearInterval(intervalId);
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, markActivity);
      }
    };
  }, [token]);

  useEffect(() => {
    const stateCode = String(propertyForm.state || '');
    if (stateCode) {
      loadCitiesByState(stateCode).catch(() => setCities([]));
    }
  }, [propertyForm.state]);

  useEffect(() => {
    if (!token) return;
    loadAdminDashboard().catch((err) => pushNotice('error', (err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardFrom, dashboardTo]);

  useEffect(() => {
    if (!token) return;
    loadActivityLogs().catch((err) => pushNotice('error', (err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityAdminId, activityAction]);

  useEffect(() => {
    if (!token) return;
    loadContactMessages().catch((err) => pushNotice('error', (err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactMessageStatusFilter]);

  useEffect(() => {
    if (!token) return;
    loadCareerApplications().catch((err) => pushNotice('error', (err as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [careerStatusFilter, careerJobFilter]);

  useEffect(() => {
    if (careerJobFilter === 'ALL') return;
    const exists = careerOpportunities.some((item) => item.id === careerJobFilter);
    if (!exists) {
      setCareerJobFilter('ALL');
    }
  }, [careerJobFilter, careerOpportunities]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  async function uploadForField(
    setter: Dispatch<SetStateAction<Record<string, unknown>>>,
    field: string,
    file: File | null,
    previewField?: string,
  ) {
    if (!file) return;
    setUploadingFieldCount((prev) => prev + 1);
    try {
      const asset = await uploadFile(file);
      setter((prev) => ({
        ...prev,
        [field]: String(asset.id || ''),
        ...(previewField ? { [previewField]: String(asset.url || '') } : {}),
      }));
      pushNotice('success', 'File uploaded successfully.');
    } catch (err) {
      pushNotice('error', (err as Error).message);
    } finally {
      setUploadingFieldCount((prev) => Math.max(0, prev - 1));
    }
  }

  if (!token) {
    return (
      <div
        className="admin-auth-wrapper"
        style={{ '--admin-auth-hero': `url("${loginHeroImageUrl}")` } as CSSProperties}
      >
        <div className="admin-toast-stack" aria-live="polite">
          {toast && (
            <section className={`admin-toast ${toast.type}`}>
              <p>{toast.message}</p>
              <button type="button" className="admin-toast-close" onClick={dismissToast}>
                x
              </button>
            </section>
          )}
        </div>
        <form className="admin-auth-card" onSubmit={handleLogin}>
          <img
            src={siteForm.logoPreviewUrl || '/logo.jpg'}
            alt={`${brandDisplayName} logo`}
            className="admin-auth-logo"
            onError={(event) => {
              event.currentTarget.src = '/logo.jpg';
            }}
          />
          <h1>Admin Login</h1>
          <p>Sign in to manage content, properties, and analytics.</p>
          {authError && <p className="admin-error">{authError}</p>}

          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />

          <button className="btn-primary" type="submit">
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-toast-stack" aria-live="polite">
        {toast && (
          <section className={`admin-toast ${toast.type}`}>
            <p>{toast.message}</p>
            <button type="button" className="admin-toast-close" onClick={dismissToast}>
              x
            </button>
          </section>
        )}
      </div>
      <div className="admin-shell">
        {/* ── Mobile nav overlay ── */}
        {mobileNavOpen && (
          <div
            className="admin-mobile-overlay"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside className={`admin-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
          <div className="admin-brand-block">
            <img
              src={siteForm.logoPreviewUrl || '/logo.jpg'}
              alt={`${brandDisplayName} logo`}
              className="admin-brand-logo"
              onError={(event) => {
                event.currentTarget.src = '/logo.jpg';
              }}
            />
            <p className="admin-eyebrow">{brandDisplayName}</p>
            <h1>Admin Console</h1>
            <p>Content, properties, and website operations.</p>
          </div>

          <nav className="admin-tabs" aria-label="Admin sections">
            {tabItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === tab;

              return (
                <button
                  key={item.key}
                  className={`admin-tab-button ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setTab(item.key);
                    setMobileNavOpen(false);
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="admin-sidebar-footer">
            {currentAdmin && (
              <button
                type="button"
                className={`admin-user-pill admin-profile-shortcut ${tab === 'profile' ? 'active' : ''}`}
                aria-label="Open profile and security settings"
                onClick={() => {
                  setTab('profile');
                  setMobileNavOpen(false);
                }}
              >
                <img
                  src={sidebarAvatarSrc}
                  alt={currentAdmin.fullName}
                  className="admin-user-avatar"
                  onError={(event) => {
                    event.currentTarget.src = '/logo.jpg';
                  }}
                />
                <span className="admin-user-meta">
                  <span className="admin-user-name">{currentAdmin.fullName}</span>
                  <span className="admin-user-subtitle">Profile &amp; Security</span>
                </span>
              </button>
            )}
            <button className="btn-secondary" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-main-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {/* Hamburger — mobile only */}
              <button
                className="admin-hamburger"
                aria-label="Open navigation"
                aria-expanded={mobileNavOpen}
                onClick={() => setMobileNavOpen((prev) => !prev)}
              >
                {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <div>
                <p className="admin-eyebrow">Control Panel</p>
                <h2>
                  <ActiveIcon size={18} />
                  {activeTab.label}
                </h2>
              </div>
            </div>
            <div className="admin-header-tags">
              <span className="admin-badge">Live CMS</span>
              <span className="admin-badge muted">
                <Globe2 size={14} />
                USA
              </span>
            </div>
          </header>

          <div className={`admin-main-content ${tab === 'activity' ? 'activity-view' : ''}`}>
            {tab === 'dashboard' && (
              <section className="admin-section">
                <div className="admin-section-head split">
                  <div>
                    <h2>Website Insights</h2>
                    <p>Track visits, section engagement, and top-viewed properties.</p>
                  </div>

                  <div className="inline-group compact">
                    <label>
                      <span>From</span>
                      <input
                        type="date"
                        value={dashboardFrom}
                        onChange={(e) => setDashboardFrom(e.target.value)}
                      />
                    </label>
                    <label>
                      <span>To</span>
                      <input
                        type="date"
                        value={dashboardTo}
                        onChange={(e) => setDashboardTo(e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div className="metric-grid">
                  <article className="metric-card">
                    <p>Total Visits</p>
                    <strong>{dashboard?.totalVisits || 0}</strong>
                  </article>
                  <article className="metric-card">
                    <p>Unique Visitors</p>
                    <strong>{dashboard?.uniqueVisitors || 0}</strong>
                  </article>
                </div>

                <div className="dashboard-panels">
                  <article className="dashboard-panel">
                    <h3>Top Viewed Sections</h3>
                    {!dashboard?.topSections.length ? (
                      <p className="admin-empty">No data in this range.</p>
                    ) : (
                      <ul className="dashboard-list">
                        {dashboard.topSections.map((item) => (
                          <li key={item.sectionKey}>
                            <span>{formatSectionLabel(item.sectionKey || 'unknown')}</span>
                            <strong>{item.views}</strong>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>

                  <article className="dashboard-panel">
                    <h3>Top Viewed Properties</h3>
                    {!dashboard?.topProperties.length ? (
                      <p className="admin-empty">No data in this range.</p>
                    ) : (
                      <ul className="dashboard-list">
                        {dashboard.topProperties.map((item, index) => (
                          <li key={`${item.title}-${index}`}>
                            <span>{item.title}</span>
                            <strong>{item.views}</strong>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </div>
              </section>
            )}

            {tab === 'profile' && (
              <section className="admin-section">
                <div className="admin-section-head split">
                  <div>
                    <h2>Profile & Security Settings</h2>
                    <p>Manage your profile information and password from this section.</p>
                  </div>
                </div>

                <div className="admin-profile-grid">
                  <article className="admin-profile-card">
                    <p className="admin-profile-section-label">Profile Settings</p>
                    <div className="admin-section-head split">
                      <div>
                        <h3>Profile Details</h3>
                        <p>Update your display name and profile picture. Login email is read-only.</p>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setIsProfileFormOpen((prev) => !prev)}
                      >
                        {isProfileFormOpen ? 'Close Form' : 'Edit Profile'}
                      </button>
                    </div>

                    <div className="admin-profile-preview">
                      <img
                        src={profileForm.profileImagePreviewUrl || '/logo.jpg'}
                        alt={profileForm.fullName || 'Admin profile'}
                        className="admin-profile-avatar"
                        onError={(event) => {
                          event.currentTarget.src = '/logo.jpg';
                        }}
                      />
                      <div>
                        <h4>{profileForm.fullName || currentAdmin?.fullName || 'Admin'}</h4>
                        <p>{profileForm.email || currentAdmin?.email || '-'}</p>
                      </div>
                    </div>

                    {isProfileFormOpen && (
                      <form className="admin-form admin-form-panel" onSubmit={saveProfile}>
                        <label>
                          <span>Full Name</span>
                          <input
                            value={profileForm.fullName}
                            onChange={(e) =>
                              setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                            }
                            placeholder="Your full name"
                          />
                        </label>
                        <label>
                          <span>Login Email (Read Only)</span>
                          <input
                            type="email"
                            value={profileForm.email}
                            readOnly
                            disabled
                          />
                        </label>
                        <div className="inline-group">
                          <label>
                            <span>Profile Image Asset ID</span>
                            <input
                              value={profileForm.profileImageAssetId}
                              onChange={(e) =>
                                setProfileForm((prev) => ({
                                  ...prev,
                                  profileImageAssetId: e.target.value,
                                }))
                              }
                              placeholder="Asset ID"
                            />
                          </label>
                          <label>
                            <span>Upload Profile Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => uploadProfileImage(e.target.files?.[0] || null)}
                            />
                          </label>
                        </div>
                        <div className="admin-form-actions">
                          <button type="submit" className="btn-primary" disabled={uploadingFieldCount > 0}>
                            Save Profile
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setIsProfileFormOpen(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </article>

                  <article className="admin-profile-card">
                    <p className="admin-profile-section-label">Security Settings</p>
                    <div className="admin-section-head split">
                      <div>
                        <h3>Change Password</h3>
                        <p>Password must be at least 8 characters with letters and numbers.</p>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setIsPasswordFormOpen((prev) => !prev)}
                      >
                        {isPasswordFormOpen ? 'Close Form' : 'Change Password'}
                      </button>
                    </div>

                    {isPasswordFormOpen && (
                      <form className="admin-form admin-form-panel" onSubmit={changePassword}>
                        <label>
                          <span>Current Password</span>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                            placeholder="Current password"
                          />
                        </label>
                        <label>
                          <span>New Password</span>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            placeholder="New password"
                          />
                        </label>
                        <label>
                          <span>Confirm New Password</span>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                            placeholder="Confirm new password"
                          />
                        </label>

                        <div className="admin-form-actions">
                          <button type="submit" className="btn-primary">
                            Update Password
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setIsPasswordFormOpen(false);
                              setPasswordForm({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                              });
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </article>
                </div>
              </section>
            )}

            {tab === 'admins' && (
              <section className="admin-section">
                <div className="admin-section-head split">
                  <div>
                    <h2>Admin Management</h2>
                    <p>Add additional admins and maintain secure ownership controls.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsAdminFormOpen((prev) => !prev)}
                  >
                    {isAdminFormOpen ? 'Close Form' : 'Add New Admin'}
                  </button>
                </div>

                {isAdminFormOpen && (
                  <form className="admin-form admin-form-grid admin-form-panel" onSubmit={handleAdminCreate}>
                    <label>
                      <span>Full Name</span>
                      <input
                        required
                        placeholder="Jane Doe"
                        value={newAdmin.fullName}
                        onChange={(e) =>
                          setNewAdmin((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Email</span>
                      <input
                        required
                        type="email"
                        placeholder="jane@company.com"
                        value={newAdmin.email}
                        onChange={(e) =>
                          setNewAdmin((prev) => ({ ...prev, email: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Password</span>
                      <input
                        required
                        type="password"
                        placeholder="Strong password"
                        value={newAdmin.password}
                        onChange={(e) =>
                          setNewAdmin((prev) => ({ ...prev, password: e.target.value }))
                        }
                      />
                    </label>
                    <div className="admin-form-actions align-end">
                      <button type="submit" className="btn-primary">
                        Add Admin
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => setIsAdminFormOpen(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="admin-list">
                  {admins.map((admin) => (
                    <article key={admin.id} className="admin-list-item">
                      <div className="admin-item-main">
                        <h3>{admin.fullName}</h3>
                        <p className="admin-item-meta">{admin.email}</p>
                        {admin.isSystemAdmin && <span className="admin-pill">System Admin</span>}
                      </div>
                      <div className="admin-item-actions">
                        <button
                          type="button"
                          className="btn-danger"
                          disabled={admin.id === currentAdmin?.id || admin.isSystemAdmin}
                          onClick={() => handleAdminDelete(admin.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {tab === 'home' && (
              <section className="admin-section">
                <div className="admin-section-head">
                  <h2>Homepage Blocks</h2>
                  <p>
                    Dedicated CRUD manager for each homepage section. Each panel only handles one
                    section type.
                  </p>
                </div>

                <div className="admin-home-sections">
                  {homeBlockSectionConfigs.map((config) => (
                    <HomeBlockSectionManager
                      key={config.type}
                      config={config}
                      onFeedback={(type, message) => pushNotice(type, message)}
                      uploadForField={uploadForField}
                    />
                  ))}
                </div>
              </section>
            )}

            {tab === 'about' && (
              <GenericListManager<AboutSection>
                title="About Sections"
                subtitle="Manage dynamic text and media blocks for the About page."
                entityLabel="About section"
                onFeedback={(type, message) => pushNotice(type, message)}
                endpoint="/api/admin/about-sections"
                defaults={{ title: '', body: '', imageAssetId: '', sortOrder: 0, isVisible: true }}
                renderFields={(form, setForm) => (
                  <>
                    <label>
                      <span>Title</span>
                      <input
                        placeholder="Section title"
                        value={String(form.title || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Body</span>
                      <textarea
                        placeholder="Section content"
                        value={String(form.body || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, body: e.target.value }))
                        }
                      />
                    </label>
                    <div className="inline-group">
                      <label>
                        <span>Image Asset ID</span>
                        <input
                          placeholder="Asset ID"
                          value={String(form.imageAssetId || '')}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, imageAssetId: e.target.value }))
                          }
                        />
                      </label>
                      <label>
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) =>
                            uploadForField(
                              setForm,
                              'imageAssetId',
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="inline-group">
                      <label>
                        <span>Sort Order</span>
                        <input
                          type="number"
                          value={Number(form.sortOrder || 0)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))
                          }
                        />
                      </label>
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={Boolean(form.isVisible)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, isVisible: e.target.checked }))
                          }
                        />
                        <span>Visible</span>
                      </label>
                    </div>
                  </>
                )}
                toPayload={(form) => ({
                  title: form.title,
                  body: form.body,
                  imageAssetId: form.imageAssetId || null,
                  sortOrder: Number(form.sortOrder || 0),
                  isVisible: Boolean(form.isVisible),
                })}
                summary={(item) => (
                  <>
                    <h3>{item.title}</h3>
                    <p className="admin-item-meta">{item.body.slice(0, 160)}...</p>
                  </>
                )}
              />
            )}

            {tab === 'services' && (
              <GenericListManager<ServiceItem>
                title="Services"
                subtitle="Add unlimited service cards with optional icon and image."
                entityLabel="Service"
                onFeedback={(type, message) => pushNotice(type, message)}
                endpoint="/api/admin/services"
                defaults={{
                  title: '',
                  description: '',
                  icon: '',
                  imageAssetId: '',
                  sortOrder: 0,
                  isVisible: true,
                }}
                renderFields={(form, setForm) => (
                  <>
                    <label>
                      <span>Title</span>
                      <input
                        placeholder="Service title"
                        value={String(form.title || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Description</span>
                      <textarea
                        placeholder="Service description"
                        value={String(form.description || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Icon</span>
                      <input
                        placeholder="Optional"
                        value={String(form.icon || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, icon: e.target.value }))
                        }
                      />
                    </label>
                    <div className="inline-group">
                      <label>
                        <span>Image Asset ID</span>
                        <input
                          placeholder="Asset ID"
                          value={String(form.imageAssetId || '')}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, imageAssetId: e.target.value }))
                          }
                        />
                      </label>
                      <label>
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) =>
                            uploadForField(
                              setForm,
                              'imageAssetId',
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="inline-group">
                      <label>
                        <span>Sort Order</span>
                        <input
                          type="number"
                          value={Number(form.sortOrder || 0)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))
                          }
                        />
                      </label>
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={Boolean(form.isVisible)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, isVisible: e.target.checked }))
                          }
                        />
                        <span>Visible</span>
                      </label>
                    </div>
                  </>
                )}
                toPayload={(form) => ({
                  title: form.title,
                  description: form.description,
                  icon: form.icon || null,
                  imageAssetId: form.imageAssetId || null,
                  sortOrder: Number(form.sortOrder || 0),
                  isVisible: Boolean(form.isVisible),
                })}
                summary={(item) => (
                  <>
                    <h3>{item.title}</h3>
                    <p className="admin-item-meta">{item.description}</p>
                  </>
                )}
              />
            )}

            {tab === 'culture' && (
              <GenericListManager<ContentPageSection>
                title="Culture Sections"
                subtitle="Manage dynamic sections for the Culture page."
                entityLabel="Culture section"
                onFeedback={(type, message) => pushNotice(type, message)}
                endpoint="/api/admin/culture-sections"
                defaults={{
                  title: '',
                  body: '',
                  icon: '',
                  imageAssetId: '',
                  sortOrder: 0,
                  isVisible: true,
                }}
                renderFields={(form, setForm) => (
                  <>
                    <label>
                      <span>Title</span>
                      <input
                        placeholder="Section title"
                        value={String(form.title || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Description</span>
                      <textarea
                        placeholder="Section description"
                        value={String(form.body || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, body: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Icon (optional)</span>
                      <input
                        placeholder="e.g. 🌿"
                        value={String(form.icon || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, icon: e.target.value }))
                        }
                      />
                    </label>
                    <div className="inline-group">
                      <label>
                        <span>Image Asset ID</span>
                        <input
                          placeholder="Asset ID"
                          value={String(form.imageAssetId || '')}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, imageAssetId: e.target.value }))
                          }
                        />
                      </label>
                      <label>
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) =>
                            uploadForField(
                              setForm,
                              'imageAssetId',
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="inline-group">
                      <label>
                        <span>Sort Order</span>
                        <input
                          type="number"
                          value={Number(form.sortOrder || 0)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))
                          }
                        />
                      </label>
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={Boolean(form.isVisible)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, isVisible: e.target.checked }))
                          }
                        />
                        <span>Visible</span>
                      </label>
                    </div>
                  </>
                )}
                toPayload={(form) => ({
                  title: form.title,
                  body: form.body,
                  icon: form.icon || null,
                  imageAssetId: form.imageAssetId || null,
                  sortOrder: Number(form.sortOrder || 0),
                  isVisible: Boolean(form.isVisible),
                })}
                summary={(item) => (
                  <>
                    <h3>{item.title}</h3>
                    <p className="admin-item-meta">{item.body.slice(0, 160)}...</p>
                  </>
                )}
              />
            )}

            {tab === 'awards' && (
              <GenericListManager<ContentPageSection>
                title="Awards Sections"
                subtitle="Manage dynamic sections for the Awards page."
                entityLabel="Award section"
                onFeedback={(type, message) => pushNotice(type, message)}
                endpoint="/api/admin/award-sections"
                defaults={{
                  title: '',
                  body: '',
                  icon: '',
                  imageAssetId: '',
                  sortOrder: 0,
                  isVisible: true,
                }}
                renderFields={(form, setForm) => (
                  <>
                    <label>
                      <span>Title</span>
                      <input
                        placeholder="Section title"
                        value={String(form.title || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Description</span>
                      <textarea
                        placeholder="Section description"
                        value={String(form.body || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, body: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Icon (optional)</span>
                      <input
                        placeholder="e.g. 🏆"
                        value={String(form.icon || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, icon: e.target.value }))
                        }
                      />
                    </label>
                    <div className="inline-group">
                      <label>
                        <span>Image Asset ID</span>
                        <input
                          placeholder="Asset ID"
                          value={String(form.imageAssetId || '')}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, imageAssetId: e.target.value }))
                          }
                        />
                      </label>
                      <label>
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) =>
                            uploadForField(
                              setForm,
                              'imageAssetId',
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="inline-group">
                      <label>
                        <span>Sort Order</span>
                        <input
                          type="number"
                          value={Number(form.sortOrder || 0)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))
                          }
                        />
                      </label>
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={Boolean(form.isVisible)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, isVisible: e.target.checked }))
                          }
                        />
                        <span>Visible</span>
                      </label>
                    </div>
                  </>
                )}
                toPayload={(form) => ({
                  title: form.title,
                  body: form.body,
                  icon: form.icon || null,
                  imageAssetId: form.imageAssetId || null,
                  sortOrder: Number(form.sortOrder || 0),
                  isVisible: Boolean(form.isVisible),
                })}
                summary={(item) => (
                  <>
                    <h3>{item.title}</h3>
                    <p className="admin-item-meta">{item.body.slice(0, 160)}...</p>
                  </>
                )}
              />
            )}

            {tab === 'team' && (
              <GenericListManager<TeamMember>
                title="Meet Our Team"
                subtitle="Maintain leadership and team profile cards."
                entityLabel="Team member"
                onFeedback={(type, message) => pushNotice(type, message)}
                isUploadBusy={uploadingFieldCount > 0}
                endpoint="/api/admin/team-members"
                defaults={{
                  fullName: '',
                  title: '',
                  bio: '',
                  profileUrl: '',
                  imageAssetId: '',
                  imagePreviewUrl: '',
                  sortOrder: 0,
                  isVisible: true,
                }}
                renderFields={(form, setForm) => (
                  <>
                    <label>
                      <span>Full Name</span>
                      <input
                        placeholder="Full name"
                        value={String(form.fullName || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Designation</span>
                      <input
                        placeholder="Title"
                        value={String(form.title || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Bio</span>
                      <textarea
                        placeholder="Short bio"
                        value={String(form.bio || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, bio: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Profile URL</span>
                      <input
                        placeholder="https://..."
                        value={String(form.profileUrl || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, profileUrl: e.target.value }))
                        }
                      />
                    </label>
                    <div className="inline-group">
                      <label>
                        <span>Image Asset ID</span>
                        <input
                          placeholder="Asset ID"
                          value={String(form.imageAssetId || '')}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, imageAssetId: e.target.value }))
                          }
                        />
                      </label>
                      <label>
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const input = e.currentTarget;
                            await uploadForField(
                              setForm,
                              'imageAssetId',
                              e.target.files?.[0] || null,
                              'imagePreviewUrl',
                            );
                            input.value = '';
                          }}
                        />
                      </label>
                    </div>
                    {String(form.imageAssetId || '').trim() && (
                      <p className="admin-item-meta">
                        Assigned Asset ID: <strong>{String(form.imageAssetId)}</strong>
                      </p>
                    )}
                    {((form.imageAsset as { url?: string } | undefined)?.url ||
                      String(form.imagePreviewUrl || '')) && (
                      <div className="admin-image-preview">
                        <img
                          src={
                            resolveAssetUrl(
                              (form.imageAsset as { url?: string } | undefined)?.url ||
                                String(form.imagePreviewUrl || ''),
                            ) || '/no-image.svg'
                          }
                          alt="Team preview"
                        />
                      </div>
                    )}
                    <div className="inline-group">
                      <label>
                        <span>Sort Order</span>
                        <input
                          type="number"
                          value={Number(form.sortOrder || 0)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))
                          }
                        />
                      </label>
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={Boolean(form.isVisible)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, isVisible: e.target.checked }))
                          }
                        />
                        <span>Visible</span>
                      </label>
                    </div>
                  </>
                )}
                toPayload={(form) => ({
                  fullName: form.fullName,
                  title: form.title,
                  bio: form.bio,
                  profileUrl: form.profileUrl || null,
                  imageAssetId: String(form.imageAssetId || '').trim() || null,
                  sortOrder: Number(form.sortOrder || 0),
                  isVisible: Boolean(form.isVisible),
                })}
                summary={(item) => (
                  <>
                    <h3>{item.fullName}</h3>
                    <p className="admin-item-meta">{item.title}</p>
                  </>
                )}
              />
            )}

            {tab === 'brands' && (
              <GenericListManager<HotelBrand>
                title="Brand Owners"
                subtitle="Manage hotel brands used as top-level portfolio filters."
                entityLabel="Brand"
                onFeedback={(type, message) => pushNotice(type, message)}
                endpoint="/api/admin/hotel-brands"
                defaults={{ name: '', logoAssetId: '', sortOrder: 0, isActive: true }}
                renderFields={(form, setForm) => (
                  <>
                    <label>
                      <span>Brand Name</span>
                      <input
                        placeholder="Hilton"
                        value={String(form.name || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </label>
                    <div className="inline-group">
                      <label>
                        <span>Logo Asset ID</span>
                        <input
                          placeholder="Asset ID"
                          value={String(form.logoAssetId || '')}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, logoAssetId: e.target.value }))
                          }
                        />
                      </label>
                      <label>
                        <span>Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) =>
                            uploadForField(
                              setForm,
                              'logoAssetId',
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="inline-group">
                      <label>
                        <span>Sort Order</span>
                        <input
                          type="number"
                          value={Number(form.sortOrder || 0)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))
                          }
                        />
                      </label>
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={Boolean(form.isActive)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                          }
                        />
                        <span>Active</span>
                      </label>
                    </div>
                  </>
                )}
                toPayload={(form) => ({
                  name: form.name,
                  logoAssetId: form.logoAssetId || null,
                  sortOrder: Number(form.sortOrder || 0),
                  isActive: Boolean(form.isActive),
                })}
                summary={(item) => (
                  <>
                    <div className="admin-inline-logo-wrap">
                      <img
                        src={item.logoAsset?.url ? resolveAssetUrl(item.logoAsset.url) : '/logo.jpg'}
                        alt={`${item.name} logo`}
                        className="admin-inline-logo"
                        onError={(event) => {
                          event.currentTarget.src = '/logo.jpg';
                        }}
                      />
                    </div>
                    <h3>{item.name}</h3>
                    <p className="admin-item-meta">{item.isActive ? 'Active' : 'Inactive'}</p>
                  </>
                )}
              />
            )}

            {tab === 'properties' && (
              <section className="admin-section">
                <div className="admin-section-head split">
                  <div>
                    <h2>Portfolio Properties</h2>
                    <p>Brand-based property manager with status chips, visibility toggle, and gallery upload.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      if (isPropertyFormOpen && !editingPropertyId) {
                        setIsPropertyFormOpen(false);
                        return;
                      }
                      setEditingPropertyId(null);
                      setPropertyForm(emptyPropertyForm);
                      setIsPropertyFormOpen(true);
                    }}
                  >
                    {isPropertyFormOpen && !editingPropertyId ? 'Close Form' : 'Add New Property'}
                  </button>
                </div>

                {propertyError && <p className="admin-error">{propertyError}</p>}

                {isPropertyFormOpen && (
                <form className="admin-form admin-form-panel" onSubmit={handlePropertySubmit}>
                  <div className="admin-form-grid two">
                    <label>
                      <span>Property Title*</span>
                      <input
                        required
                        placeholder="Property title"
                        value={propertyForm.title}
                        onChange={(e) =>
                          setPropertyForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </label>

                    <label>
                      <span>Slug</span>
                      <input
                        placeholder="auto-if-empty"
                        value={propertyForm.slug}
                        onChange={(e) =>
                          setPropertyForm((prev) => ({ ...prev, slug: e.target.value }))
                        }
                      />
                    </label>

                    <label>
                      <span>Brand*</span>
                      <select
                        required
                        value={propertyForm.brandId}
                        onChange={(e) =>
                          setPropertyForm((prev) => ({ ...prev, brandId: e.target.value }))
                        }
                      >
                        <option value="">Select brand</option>
                        {brands.map((brand) => (
                          <option value={brand.id} key={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Status</span>
                      <select
                        value={propertyForm.status}
                        onChange={(e) =>
                          setPropertyForm((prev) => ({
                            ...prev,
                            status: e.target.value as PropertyFormState['status'],
                          }))
                        }
                      >
                        {propertyStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label>
                    <span>Short Description*</span>
                    <textarea
                      required
                      placeholder="Summary for property card"
                      value={propertyForm.shortDescription}
                      onChange={(e) =>
                        setPropertyForm((prev) => ({ ...prev, shortDescription: e.target.value }))
                      }
                    />
                  </label>

                  <label>
                    <span>Full Description</span>
                    <textarea
                      placeholder="Full detail page description"
                      value={propertyForm.fullDescription}
                      onChange={(e) =>
                        setPropertyForm((prev) => ({ ...prev, fullDescription: e.target.value }))
                      }
                    />
                  </label>

                  <div className="inline-group">
                    <label>
                      <span>Address Search</span>
                      <input
                        placeholder="Start typing address"
                        onChange={(e) => {
                          const value = e.target.value;
                          addressSearch(value).catch(() => setSuggestions([]));
                        }}
                      />
                    </label>
                    <div>
                      {suggestions.length > 0 && (
                        <div className="suggestions-list">
                          {suggestions.map((item, index) => (
                            <button
                              type="button"
                              key={`${item.display_name}-${index}`}
                              onClick={() => applyAddressSuggestion(item)}
                            >
                              {item.display_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-form-grid two">
                    <label>
                      <span>Address Line 1*</span>
                      <input
                        required
                        placeholder="Address line 1"
                        value={propertyForm.addressLine1}
                        onChange={(e) =>
                          setPropertyForm((prev) => ({ ...prev, addressLine1: e.target.value }))
                        }
                      />
                    </label>

                    <label>
                      <span>Address Line 2</span>
                      <input
                        placeholder="Address line 2"
                        value={propertyForm.addressLine2}
                        onChange={(e) =>
                          setPropertyForm((prev) => ({ ...prev, addressLine2: e.target.value }))
                        }
                      />
                    </label>

                    <label>
                      <span>State*</span>
                      <select
                        value={propertyForm.state}
                        onChange={(e) =>
                          setPropertyForm((prev) => ({ ...prev, state: e.target.value }))
                        }
                      >
                        {states.map((state) => (
                          <option value={state.code} key={state.code}>
                            {state.name} ({state.code})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>City*</span>
                      <select
                        value={propertyForm.city}
                        onChange={(e) =>
                          setPropertyForm((prev) => ({ ...prev, city: e.target.value }))
                        }
                      >
                        <option value="">Select city</option>
                        {cities.map((city, index) => (
                          <option key={`${city.name}-${index}`} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>ZIP Code*</span>
                      <input
                        required
                        placeholder="ZIP code"
                        value={propertyForm.zipCode}
                        onChange={(e) =>
                          setPropertyForm((prev) => ({ ...prev, zipCode: e.target.value }))
                        }
                      />
                    </label>

                    <label>
                      <span>Country</span>
                      <input value="USA" readOnly />
                    </label>
                  </div>

                  <div className="inline-group">
                    <label>
                      <span>Cover Image Asset ID</span>
                      <input
                        placeholder="Asset ID"
                        value={propertyForm.coverImageAssetId}
                        onChange={(e) =>
                          setPropertyForm((prev) => ({ ...prev, coverImageAssetId: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Upload Cover Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadAndSetCover(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '1.2rem' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#534f47', display: 'block', marginBottom: '0.4rem' }}>Additional Key Info (Rich Text)</span>
                    <RichTextEditor
                      value={propertyForm.keyInfoText}
                      onChange={(content: string) =>
                        setPropertyForm((prev) => ({ ...prev, keyInfoText: content }))
                      }
                      placeholder="Add additional property information..."
                    />
                  </div>

                  <div className="inline-group">
                    <label>
                      <span>Sort Order</span>
                      <input
                        type="number"
                        value={propertyForm.sortOrder}
                        onChange={(e) =>
                          setPropertyForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))
                        }
                      />
                    </label>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={propertyForm.isVisible}
                        onChange={(e) =>
                          setPropertyForm((prev) => ({ ...prev, isVisible: e.target.checked }))
                        }
                      />
                      <span>Visible on website</span>
                    </label>
                  </div>

                  <div className="admin-form-actions">
                    <button className="btn-primary" type="submit">
                      {editingPropertyId ? 'Update Property' : 'Create Property'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setEditingPropertyId(null);
                        setPropertyForm(emptyPropertyForm);
                        setIsPropertyFormOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                )}

                <div className="admin-list">
                  {properties.map((property) => (
                    <article key={property.id} className="admin-list-item">
                      <div className="admin-item-main">
                        <h3>{property.title}</h3>
                        <p className="admin-item-meta">
                          {property.brand?.name || 'Brand'} | {property.city}, {property.state}
                        </p>
                        <div className="admin-chip-row">
                          <span className="admin-pill">
                            {propertyStatusOptions.find((item) => item.value === property.status)
                              ?.label || property.status}
                          </span>
                          <span className={`admin-pill ${property.isVisible ? '' : 'muted'}`}>
                            {property.isVisible ? 'Visible' : 'Hidden'}
                          </span>
                          <span className="admin-pill muted">
                            {property.images?.length || 0} gallery image(s)
                          </span>
                        </div>
                      </div>
                      <div className="admin-item-actions">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setEditingPropertyId(property.id);
                            setIsPropertyFormOpen(true);
                            setPropertyForm({
                              title: property.title,
                              slug: property.slug,
                              brandId: property.brandId,
                              shortDescription: property.shortDescription,
                              fullDescription: property.fullDescription || '',
                              status: property.status,
                              isVisible: property.isVisible,
                              addressLine1: property.addressLine1,
                              addressLine2: property.addressLine2 || '',
                              city: property.city,
                              state: property.state,
                              zipCode: property.zipCode,
                              country: 'USA',
                              sortOrder: property.sortOrder,
                              keyInfoText:
                                property.keyInfo &&
                                typeof property.keyInfo === 'object' &&
                                'html' in property.keyInfo
                                  ? String((property.keyInfo as { html?: unknown }).html || '')
                                  : '',
                              coverImageAssetId: property.coverImageAssetId || '',
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setSelectedPropertyIdForGallery(property.id)}
                        >
                          <ImagePlus size={15} />
                          Gallery
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handlePropertyDelete(property.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {selectedProperty && (
                  <div className="admin-subsection">
                    <div className="admin-section-head split">
                      <div>
                        <h3>Gallery: {selectedProperty.title}</h3>
                        <p>
                          Upload multiple images. Set one image as cover for listing previews.
                        </p>
                      </div>
                      <label className="btn-secondary upload-btn">
                        <ImagePlus size={16} />
                        Upload Images
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => uploadGalleryImages(e.target.files)}
                        />
                      </label>
                    </div>

                    <div className="gallery-grid">
                      {(selectedProperty.images || []).map((image) => (
                        <article className="gallery-item" key={image.id}>
                          <img
                            src={resolveAssetUrl(image.asset?.url || noImagePlaceholder)}
                            alt={image.altText || selectedProperty.title}
                          />
                          <div className="gallery-actions">
                            <button
                              className="btn-secondary"
                              onClick={() => setGalleryCover(image.id)}
                            >
                              {image.isCover ? 'Cover Image' : 'Set as Cover'}
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => deleteGalleryImage(image.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {tab === 'social' && (
              <GenericListManager<SocialLink>
                title="Footer Social Links"
                subtitle="Manage dynamic social URLs shown in the website footer."
                entityLabel="Social link"
                onFeedback={(type, message) => pushNotice(type, message)}
                endpoint="/api/admin/social-links"
                defaults={{
                  platform: '',
                  url: '',
                  iconKey: '',
                  sortOrder: 0,
                  isVisible: true,
                }}
                renderFields={(form, setForm) => (
                  <>
                    <label>
                      <span>Platform</span>
                      <input
                        placeholder="Instagram"
                        value={String(form.platform || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, platform: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>URL</span>
                      <input
                        placeholder="https://"
                        value={String(form.url || '')}
                        onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Icon Key</span>
                      <input
                        placeholder="instagram"
                        value={String(form.iconKey || '')}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, iconKey: e.target.value }))
                        }
                      />
                    </label>
                    <div className="inline-group">
                      <label>
                        <span>Sort Order</span>
                        <input
                          type="number"
                          value={Number(form.sortOrder || 0)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))
                          }
                        />
                      </label>
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={Boolean(form.isVisible)}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, isVisible: e.target.checked }))
                          }
                        />
                        <span>Visible</span>
                      </label>
                    </div>
                  </>
                )}
                toPayload={(form) => ({
                  platform: form.platform,
                  url: form.url,
                  iconKey: form.iconKey || null,
                  sortOrder: Number(form.sortOrder || 0),
                  isVisible: Boolean(form.isVisible),
                })}
                summary={(item) => (
                  <>
                    <h3>{item.platform}</h3>
                    <p className="admin-item-meta">{item.url}</p>
                  </>
                )}
              />
            )}

            {tab === 'contactInfo' && (
                <section className="admin-section">
                  <div className="admin-section-head split">
                    <div>
                      <h2>Contact Information</h2>
                      <p>Manage the public Contact page details shown on the website.</p>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsContactFormOpen((prev) => !prev)}
                    >
                      {isContactFormOpen ? 'Close Form' : 'Edit Contact'}
                    </button>
                  </div>

                  <div className="admin-list">
                    <article className="admin-list-item">
                      <div className="admin-item-main">
                        <h3>{contactForm.heading || 'Contact Us'}</h3>
                        <p className="admin-item-meta">{contactForm.address || 'No address set.'}</p>
                        <p className="admin-item-meta">
                          General: {contactForm.generalEmail || '-'} | {contactForm.generalPhone || '-'}
                        </p>
                        <p className="admin-item-meta">
                          Investment: {contactForm.investmentEmail || '-'} | {contactForm.investmentPhone || '-'}
                        </p>
                      </div>
                    </article>
                  </div>

                  {isContactFormOpen && (
                    <form className="admin-form admin-form-panel" onSubmit={saveContact}>
                      <div className="admin-form-grid two">
                        <label>
                          <span>Heading</span>
                          <input
                            placeholder="Contact Us"
                            value={contactForm.heading}
                            onChange={(e) =>
                              setContactForm((prev) => ({ ...prev, heading: e.target.value }))
                            }
                          />
                        </label>
                        <label>
                          <span>Address</span>
                          <input
                            placeholder="Address"
                            value={contactForm.address}
                            onChange={(e) =>
                              setContactForm((prev) => ({ ...prev, address: e.target.value }))
                            }
                          />
                        </label>
                      </div>

                      <label>
                        <span>Intro Text</span>
                        <textarea
                          placeholder="Intro text"
                          value={contactForm.introText}
                          onChange={(e) =>
                            setContactForm((prev) => ({ ...prev, introText: e.target.value }))
                          }
                        />
                      </label>

                      <div className="admin-form-grid two">
                        <label>
                          <span>Investment Email</span>
                          <input
                            placeholder="Investment email"
                            value={contactForm.investmentEmail}
                            onChange={(e) =>
                              setContactForm((prev) => ({ ...prev, investmentEmail: e.target.value }))
                            }
                          />
                        </label>
                        <label>
                          <span>Investment Phone</span>
                          <input
                            placeholder="Investment phone"
                            value={contactForm.investmentPhone}
                            onChange={(e) =>
                              setContactForm((prev) => ({ ...prev, investmentPhone: e.target.value }))
                            }
                          />
                        </label>
                        <label>
                          <span>General Email</span>
                          <input
                            placeholder="General email"
                            value={contactForm.generalEmail}
                            onChange={(e) =>
                              setContactForm((prev) => ({ ...prev, generalEmail: e.target.value }))
                            }
                          />
                        </label>
                        <label>
                          <span>General Phone</span>
                          <input
                            placeholder="General phone"
                            value={contactForm.generalPhone}
                            onChange={(e) =>
                              setContactForm((prev) => ({ ...prev, generalPhone: e.target.value }))
                            }
                          />
                        </label>
                      </div>

                      <div className="admin-form-actions">
                        <button className="btn-primary" type="submit">
                          Save Contact Info
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setIsContactFormOpen(false)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </section>
            )}

            {tab === 'contactMessages' && (
                <section className="admin-section">
                  <div className="admin-section-head split">
                    <div>
                      <h2>Contact Messages</h2>
                      <p>Review all form submissions and open each message to manage status and notes.</p>
                    </div>
                    <label>
                      <span>Status Filter</span>
                      <select
                        value={contactMessageStatusFilter}
                        onChange={(event) =>
                          setContactMessageStatusFilter(
                            event.target.value as 'ALL' | ContactMessageStatus,
                          )
                        }
                      >
                        <option value="ALL">All Statuses</option>
                        {contactMessageStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {formatSectionLabel(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {contactMessages.length === 0 ? (
                    <p className="admin-empty">No contact messages found.</p>
                  ) : (
                    <div className="admin-list">
                      {contactMessages.map((item) => (
                        <article
                          key={item.id}
                          className={`admin-list-item admin-message-item ${statusToneClass(item.status)}`}
                        >
                          <div className="admin-item-main">
                            <h3>{item.fullName}</h3>
                            <p className="admin-item-meta">
                              {item.email} {item.phone ? `| ${item.phone}` : ''}
                            </p>
                            <p className="admin-item-meta">
                              Subject: {item.subject || 'General Inquiry'} |{' '}
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                            <p className="admin-message-body">{item.message}</p>
                            <div className="admin-chip-row">
                              <span className={`admin-pill ${statusToneClass(item.status)}`}>
                                {formatSectionLabel(item.status)}
                              </span>
                            </div>
                          </div>

                          <div className="admin-item-actions">
                            <button
                              type="button"
                              className="btn-secondary btn-manage"
                              onClick={() => openContactMessageModal(item)}
                            >
                              Manage
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
            )}

            {tab === 'careers' && (
              <>
                <GenericListManager<CareerOpportunityEntry>
                  title="Job Opportunities"
                  subtitle="Create and manage active job postings shown on the Careers page."
                  entityLabel="Job Opportunity"
                  endpoint="/api/admin/career-opportunities"
                  onFeedback={(type, message) => {
                    pushNotice(type, message);
                    loadCareerOpportunities().catch((err) => pushNotice('error', (err as Error).message));
                  }}
                  defaults={{
                    title: '',
                    department: '',
                    employmentType: '',
                    locationCity: '',
                    locationState: '',
                    description: '',
                    sortOrder: 0,
                    isActive: true,
                  }}
                  renderFields={(form, setForm) => (
                    <>
                      <label>
                        <span>Job Title</span>
                        <input
                          value={String(form.title || '')}
                          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Front Desk Manager"
                        />
                      </label>
                      <div className="admin-form-grid two">
                        <label>
                          <span>Department</span>
                          <input
                            value={String(form.department || '')}
                            onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                            placeholder="Operations"
                          />
                        </label>
                        <label>
                          <span>Employment Type</span>
                          <input
                            value={String(form.employmentType || '')}
                            onChange={(e) => setForm((prev) => ({ ...prev, employmentType: e.target.value }))}
                            placeholder="Full-time"
                          />
                        </label>
                      </div>
                      <div className="admin-form-grid two">
                        <label>
                          <span>City</span>
                          <input
                            value={String(form.locationCity || '')}
                            onChange={(e) => setForm((prev) => ({ ...prev, locationCity: e.target.value }))}
                            placeholder="Los Angeles"
                          />
                        </label>
                        <label>
                          <span>State</span>
                          <input
                            value={String(form.locationState || '')}
                            onChange={(e) => setForm((prev) => ({ ...prev, locationState: e.target.value }))}
                            placeholder="CA"
                          />
                        </label>
                      </div>
                      <label>
                        <span>Job Description</span>
                        <textarea
                          rows={4}
                          value={String(form.description || '')}
                          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Role responsibilities and requirements."
                        />
                      </label>
                      <div className="inline-group">
                        <label>
                          <span>Sort Order</span>
                          <input
                            type="number"
                            value={Number(form.sortOrder || 0)}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))
                            }
                          />
                        </label>
                        <label className="toggle-label">
                          <input
                            type="checkbox"
                            checked={Boolean(form.isActive)}
                            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                          />
                          <span>Active</span>
                        </label>
                      </div>
                    </>
                  )}
                  toPayload={(form) => ({
                    title: String(form.title || '').trim(),
                    department: String(form.department || '').trim() || null,
                    employmentType: String(form.employmentType || '').trim() || null,
                    locationCity: String(form.locationCity || '').trim() || null,
                    locationState: String(form.locationState || '').trim() || null,
                    description: String(form.description || '').trim(),
                    sortOrder: Number(form.sortOrder || 0),
                    isActive: Boolean(form.isActive),
                  })}
                  summary={(item) => (
                    <>
                      <h3>{item.title}</h3>
                      <p className="admin-item-meta">
                        {[item.department, item.employmentType].filter(Boolean).join(' | ') || 'No meta set'}
                      </p>
                      <p className="admin-item-meta">
                        {[item.locationCity, item.locationState].filter(Boolean).join(', ') || 'Location not set'}
                      </p>
                      <p className="admin-item-meta">
                        Status: {item.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </>
                  )}
                />

                <section className="admin-section">
                  <div className="admin-section-head split">
                    <div>
                      <h2>Career Applications</h2>
                      <p>Review and manage applications submitted from the Careers page.</p>
                    </div>
                    <div className="inline-group compact">
                      <label>
                        <span>Job Filter</span>
                        <select
                          value={careerJobFilter}
                          onChange={(event) => setCareerJobFilter(event.target.value)}
                        >
                          <option value="ALL">All Jobs</option>
                          {careerOpportunities.map((job) => (
                            <option key={job.id} value={job.id}>
                              {job.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Status Filter</span>
                        <select
                          value={careerStatusFilter}
                          onChange={(event) =>
                            setCareerStatusFilter(event.target.value as 'ALL' | CareerApplicationStatus)
                          }
                        >
                          <option value="ALL">All Statuses</option>
                          {careerStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {formatSectionLabel(status)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  {careerApplications.length === 0 ? (
                    <p className="admin-empty">No career applications found.</p>
                  ) : (
                    <div className="admin-list">
                      {careerApplications.map((item) => {
                        return (
                          <article
                            key={item.id}
                            className={`admin-list-item admin-message-item ${statusToneClass(item.status)}`}
                          >
                            <div className="admin-item-main">
                              <h3>{item.fullName}</h3>
                              <p className="admin-item-meta">
                                {item.email} | {item.phone}
                              </p>
                              <p className="admin-item-meta">
                                Position: {item.jobOpportunity?.title || item.position}
                                {item.experienceYears !== null && item.experienceYears !== undefined
                                  ? ` | ${item.experienceYears} year(s)`
                                  : ''}
                              </p>
                              <p className="admin-item-meta">
                                Location: {[item.city, item.state].filter(Boolean).join(', ') || '-'} |{' '}
                                {new Date(item.createdAt).toLocaleString()}
                              </p>
                              <p className="admin-item-meta">
                                Resume:{' '}
                                <a
                                  className="admin-link"
                                  href={resolveAssetUrl(item.resumeUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {item.resumeOriginalName}
                                </a>{' '}
                                ({formatFileSize(item.resumeSize)})
                              </p>
                              {item.coverLetter && (
                                <p className="admin-message-body">{item.coverLetter}</p>
                              )}
                              <div className="admin-chip-row">
                                <span className={`admin-pill ${statusToneClass(item.status)}`}>
                                  {formatSectionLabel(item.status)}
                                </span>
                              </div>
                            </div>

                            <div className="admin-item-actions">
                              <button
                                type="button"
                                className="btn-secondary btn-manage"
                                onClick={() => openCareerApplicationModal(item)}
                              >
                                Manage
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            )}

            {tab === 'legal' && (
              <section className="admin-section">
                <div className="admin-section-head">
                  <h2>Legal Documents</h2>
                  <p>Review all legal pages, then open a single focused editor for updates.</p>
                </div>

                <div className="admin-list admin-legal-list">
                  {(['PRIVACY', 'TERMS'] as const).map((type) => {
                    const doc = legalDocs[type];
                    const label = type === 'PRIVACY' ? 'Privacy Policy' : 'Terms & Conditions';
                    const preview = doc.content
                      ? `${doc.content.slice(0, 180)}${doc.content.length > 180 ? '...' : ''}`
                      : 'No content added yet.';

                    return (
                      <article key={type} className="admin-list-item">
                        <div className="admin-item-main">
                          <h3>{label}</h3>
                          <p className="admin-item-meta">{preview}</p>
                        </div>
                        <div className="admin-item-actions">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setActiveLegalDocType(type)}
                          >
                            Edit
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {activeLegalDocType && (
                  <form
                    className="admin-form admin-form-panel"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const isSaved = await saveLegalDoc(activeLegalDocType);
                      if (isSaved) {
                        setActiveLegalDocType(null);
                      }
                    }}
                  >
                    <div className="admin-section-head">
                      <h3>
                        Edit {activeLegalDocType === 'PRIVACY' ? 'Privacy Policy' : 'Terms & Conditions'}
                      </h3>
                    </div>

                    <label>
                      <span>Title</span>
                      <input
                        value={legalDocs[activeLegalDocType].title}
                        onChange={(e) =>
                          setLegalDocs((prev) => ({
                            ...prev,
                            [activeLegalDocType]: {
                              ...prev[activeLegalDocType],
                              title: e.target.value,
                            },
                          }))
                        }
                      />
                    </label>

                    <label>
                      <span>Content</span>
                      <textarea
                        rows={12}
                        value={legalDocs[activeLegalDocType].content}
                        onChange={(e) =>
                          setLegalDocs((prev) => ({
                            ...prev,
                            [activeLegalDocType]: {
                              ...prev[activeLegalDocType],
                              content: e.target.value,
                            },
                          }))
                        }
                      />
                    </label>

                    <div className="admin-form-actions">
                      <button type="submit" className="btn-primary">
                        Save Document
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setActiveLegalDocType(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )}

            {tab === 'site' && (
              <section className="admin-section">
                <div className="admin-section-head split">
                  <div>
                    <h2>Site Settings</h2>
                    <p>Review current branding and open the form only when updating.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsSiteFormOpen((prev) => !prev)}
                  >
                    {isSiteFormOpen ? 'Close Form' : 'Edit Site Settings'}
                  </button>
                </div>

                <div className="admin-list">
                  <article className="admin-list-item">
                    <div className="admin-item-main">
                      <h3>{siteForm.brandName || 'JSR Hotels'}</h3>
                      <p className="admin-item-meta">{siteForm.footerTagline || 'No footer tagline set.'}</p>
                    </div>
                    <div className="logo-preview-wrap">
                      <img
                        src={siteForm.logoPreviewUrl || '/logo.jpg'}
                        alt="Logo preview"
                        className="logo-preview"
                        onError={(event) => {
                          event.currentTarget.src = '/logo.jpg';
                        }}
                      />
                    </div>
                  </article>
                </div>

                {isSiteFormOpen && (
                  <form className="admin-form admin-form-panel" onSubmit={saveSiteSettings}>
                    <label>
                      <span>Brand Name</span>
                      <input
                        placeholder="Brand name"
                        value={siteForm.brandName}
                        onChange={(e) =>
                          setSiteForm((prev) => ({ ...prev, brandName: e.target.value }))
                        }
                      />
                    </label>

                    <label>
                      <span>Footer Tagline</span>
                      <textarea
                        placeholder="Footer tagline"
                        value={siteForm.footerTagline}
                        onChange={(e) =>
                          setSiteForm((prev) => ({ ...prev, footerTagline: e.target.value }))
                        }
                      />
                    </label>

                    <div className="inline-group">
                      <label>
                        <span>Logo Asset ID</span>
                        <input
                          placeholder="Logo asset id"
                          value={siteForm.logoAssetId}
                          onChange={(e) =>
                            setSiteForm((prev) => ({ ...prev, logoAssetId: e.target.value }))
                          }
                        />
                      </label>

                      <label>
                        <span>Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const asset = await uploadFile(file);
                              setSiteForm((prev) => ({
                                ...prev,
                                logoAssetId: asset.id,
                                logoPreviewUrl: resolveAssetUrl(asset.url),
                              }));
                              pushNotice('success', 'Logo uploaded successfully.');
                            } catch (err) {
                              pushNotice('error', (err as Error).message);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="logo-preview-wrap">
                      <img
                        src={siteForm.logoPreviewUrl || '/logo.jpg'}
                        alt="Logo preview"
                        className="logo-preview"
                        onError={(event) => {
                          event.currentTarget.src = '/logo.jpg';
                        }}
                      />
                    </div>

                    <div className="admin-form-actions">
                      <button className="btn-primary" type="submit">
                        Save Site Settings
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => setIsSiteFormOpen(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )}

            {tab === 'activity' && (
              <section className="admin-section admin-activity-section">
                <div className="admin-section-head split">
                  <div>
                    <h2>Activity Logs</h2>
                    <p>Track who changed what, with filters by admin and action type.</p>
                  </div>

                  <div className="inline-group compact">
                    <label>
                      <span>Admin</span>
                      <select
                        value={activityAdminId}
                        onChange={(e) => setActivityAdminId(e.target.value)}
                      >
                        <option value="ALL">All Admins</option>
                        {admins.map((admin) => (
                          <option value={admin.id} key={admin.id}>
                            {admin.fullName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Action</span>
                      <select
                        value={activityAction}
                        onChange={(e) => setActivityAction(e.target.value)}
                      >
                        <option value="ALL">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                      </select>
                    </label>
                  </div>
                </div>

                {activityLogs.length === 0 ? (
                  <p className="admin-empty">No activity found for selected filters.</p>
                ) : (
                  <div className="admin-scroll-list">
                    {activityLogs.map((log) => (
                      <article key={log.id} className="admin-list-item admin-activity-item">
                        <div className="admin-item-main">
                          <div className="admin-chip-row">
                            <span className={`admin-pill ${actionToneClass(log.action)}`}>{log.action}</span>
                            <span className="admin-pill muted">{formatSectionLabel(log.entityType)}</span>
                          </div>
                          <p className="admin-item-meta">
                            By {log.adminFullName} on{' '}
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                          <p className="admin-item-meta admin-mono">Record ID: {log.entityId || '-'}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {moderationModal && (
              <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
                <section className="admin-modal">
                  <div className="admin-section-head split">
                    <div>
                      <h3>
                        {moderationModal.kind === 'contact'
                          ? 'Manage Contact Message'
                          : 'Manage Career Application'}
                      </h3>
                      <p>{moderationModal.title}</p>
                      <p className="admin-item-meta">{moderationModal.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setModerationModal(null)}
                    >
                      Close
                    </button>
                  </div>

                  <div className="admin-modal-body">
                    <div className="admin-chip-row">
                      <span className={`admin-pill ${statusToneClass(moderationModal.status)}`}>
                        {formatSectionLabel(moderationModal.status)}
                      </span>
                    </div>
                    <p className="admin-message-body">{moderationModal.messageBody}</p>

                    {moderationModal.kind === 'career' && (
                      <p className="admin-item-meta">
                        Resume:{' '}
                        <a
                          className="admin-link"
                          href={resolveAssetUrl(moderationModal.resumeUrl)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {moderationModal.resumeLabel}
                        </a>{' '}
                        ({formatFileSize(moderationModal.resumeSize)})
                      </p>
                    )}

                    <label>
                      <span>Status</span>
                      <select
                        value={moderationModal.status}
                        onChange={(event) =>
                          setModerationModal((prev) => {
                            if (!prev) return prev;
                            if (prev.kind === 'contact') {
                              return {
                                ...prev,
                                status: event.target.value as ContactMessageStatus,
                              };
                            }
                            return {
                              ...prev,
                              status: event.target.value as CareerApplicationStatus,
                            };
                          })
                        }
                      >
                        {(moderationModal.kind === 'contact'
                          ? contactMessageStatusOptions
                          : careerStatusOptions
                        ).map((status) => (
                          <option key={status} value={status}>
                            {formatSectionLabel(status)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Admin Notes</span>
                      <textarea
                        rows={4}
                        placeholder="Notes visible to admins"
                        value={moderationModal.adminNotes}
                        onChange={(event) =>
                          setModerationModal((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  adminNotes: event.target.value,
                                }
                              : prev,
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="admin-form-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleModalSave}
                      disabled={isModalSubmitting}
                    >
                      {isModalSubmitting ? 'Saving...' : 'Save Update'}
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={handleModalDelete}
                      disabled={isModalSubmitting}
                    >
                      Delete
                    </button>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
