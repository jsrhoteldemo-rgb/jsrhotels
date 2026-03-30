import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiRequest } from '../api/http';
import { resolveAssetUrl } from '../config/api';
import { fallbackProperties, noImagePlaceholder } from '../data/fallbackContent';
import { useViewTracker } from '../hooks/useViewTracker';
import type { PortfolioProperty } from '../types/content';

import './Portfolio.css';
import './PropertyDetail.css';

function resolveGalleryImages(property: PortfolioProperty | null) {
  if (!property) return [noImagePlaceholder];

  const gallery = (property.images || [])
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => resolveAssetUrl(item.asset?.url || noImagePlaceholder));

  const cover = property.coverImageAsset?.url ? resolveAssetUrl(property.coverImageAsset.url) : null;

  const merged = [cover, ...gallery].filter(Boolean) as string[];
  return merged.length > 0 ? Array.from(new Set(merged)) : [noImagePlaceholder];
}

const PropertyDetail = () => {
  const { slug = '' } = useParams();
  const fallbackProperty = fallbackProperties.find((item) => item.slug === slug) || null;

  const [property, setProperty] = useState<PortfolioProperty | null>(fallbackProperty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useViewTracker({
    path: `/portfolio/${slug}`,
    sectionKey: 'property_detail',
    portfolioPropertyId: property?.id,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProperty() {
      try {
        setLoading(true);
        const data = await apiRequest<PortfolioProperty>(`/api/public/portfolio/${slug}`);
        if (!cancelled) {
          setProperty(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setProperty(fallbackProperty);
          setError((err as Error).message || 'Failed to load property details');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProperty();

    return () => {
      cancelled = true;
    };
  }, [fallbackProperty, slug]);

  const galleryImages = useMemo(() => resolveGalleryImages(property), [property]);

  useEffect(() => {
    setActiveIndex(0);
  }, [slug]);

  if (!loading && !property) {
    return (
      <div className="page-wrapper inner-page-padding">
        <div className="container section-padding">
          <h1 style={{ color: 'var(--color-accent)' }}>Property Not Found</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            The requested property is unavailable.
          </p>
          <Link to="/portfolio" className="btn-primary" style={{ marginTop: '1rem' }}>
            Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const statusLabel = property.status === 'UNDER_CONSTRUCTION' ? 'Under Construction' : 'Completed';

  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: '2rem' }}
        >
          <Link to="/portfolio" className="link-accent">
            &#8592; Back to Portfolio
          </Link>
          <h1 style={{ fontSize: '3rem', margin: '0.75rem 0 0.5rem 0', color: 'var(--color-accent)' }}>{property.title}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{property.shortDescription}</p>
        </motion.div>

        {error && (
          <p style={{ marginBottom: '1rem', color: '#b45309' }}>
            Showing fallback content because dynamic data is currently unavailable.
          </p>
        )}

        <div className="property-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          <div>
            <div className="portfolio-img-wrapper" style={{ height: '460px', marginBottom: '0.8rem' }}>
              <img src={galleryImages[activeIndex] || noImagePlaceholder} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.65rem' }}>
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveIndex(index)}
                  style={{
                    border: index === activeIndex ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                    borderRadius: '6px',
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#fff',
                    height: '72px',
                  }}
                >
                  <img src={image} alt={`${property.title} ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          <div className="glass-effect" style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span
                style={{
                  background: 'rgba(26, 26, 26, 0.88)',
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '0.4rem 0.7rem',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {statusLabel}
              </span>
            </div>

            <h3 style={{ marginBottom: '0.75rem' }}>Property Description</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              {property.fullDescription || property.shortDescription}
            </p>

            <h3 style={{ margin: '1.5rem 0 0.75rem 0' }}>Address</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {property.addressLine1}
              {property.addressLine2 ? `, ${property.addressLine2}` : ''}
              <br />
              {property.city}, {property.state} {property.zipCode}
              <br />
              {property.country || 'USA'}
            </p>

            <h3 style={{ margin: '1.5rem 0 0.75rem 0' }}>Hotel Brand</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>{property.brand?.name || 'N/A'}</p>

            {property.keyInfo && typeof property.keyInfo === 'object' && (
              <>
                <h3 style={{ margin: '1.5rem 0 0.75rem 0' }}>Additional Information</h3>
                <ul style={{ paddingLeft: '1.1rem', color: 'var(--color-text-muted)' }}>
                  {Object.entries(property.keyInfo).map(([key, value]) => (
                    <li key={key} style={{ marginBottom: '0.35rem' }}>
                      <strong>{key}:</strong> {String(value)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
