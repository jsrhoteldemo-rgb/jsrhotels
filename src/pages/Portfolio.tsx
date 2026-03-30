import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Portfolio.css';
import type { HotelBrand, PortfolioProperty, PortfolioStatus } from '../types/content';
import {
  fallbackBrands,
  fallbackProperties,
  noImagePlaceholder,
} from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import { resolveAssetUrl } from '../config/api';
import { useViewTracker } from '../hooks/useViewTracker';

type StatusFilter = 'ALL' | PortfolioStatus;

function getPropertyImage(property: PortfolioProperty) {
  const cover = property.coverImageAsset?.url;
  const firstGallery = property.images?.[0]?.asset?.url;

  if (cover) return resolveAssetUrl(cover);
  if (firstGallery) return resolveAssetUrl(firstGallery);
  return noImagePlaceholder;
}

const statusLabelMap: Record<PortfolioStatus, string> = {
  UNDER_CONSTRUCTION: 'Under Construction',
  COMPLETED: 'Completed',
};

const statusOrder: PortfolioStatus[] = ['UNDER_CONSTRUCTION', 'COMPLETED'];

const Portfolio = () => {
  const { data: brands } = usePublicData<HotelBrand[]>({
    path: '/api/public/brands',
    fallbackData: fallbackBrands,
  });

  const { data: properties } = usePublicData<PortfolioProperty[]>({
    path: '/api/public/portfolio',
    fallbackData: fallbackProperties,
  });

  useViewTracker({ path: '/portfolio' });

  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const statusOptions: StatusFilter[] = ['ALL', 'UNDER_CONSTRUCTION', 'COMPLETED'];

  const brandLookup = useMemo(() => {
    return new Map(brands.map((brand) => [brand.id, brand.name]));
  }, [brands]);

  const visibleProperties = useMemo(() => {
    return properties.filter((item) => item.isVisible);
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return visibleProperties
      .filter((property) => (brandFilter === 'ALL' ? true : property.brandId === brandFilter))
      .filter((property) => (statusFilter === 'ALL' ? true : property.status === statusFilter));
  }, [visibleProperties, brandFilter, statusFilter]);

  const groupedByStatus = useMemo(() => {
    return {
      UNDER_CONSTRUCTION: filteredProperties.filter((item) => item.status === 'UNDER_CONSTRUCTION'),
      COMPLETED: filteredProperties.filter((item) => item.status === 'COMPLETED'),
    };
  }, [filteredProperties]);

  const visibleStatusSections = useMemo(() => {
    return statusOrder.filter((statusKey) => groupedByStatus[statusKey].length > 0);
  }, [groupedByStatus]);

  const selectedBrandName = useMemo(() => {
    if (brandFilter === 'ALL') return 'All Brands';
    return brandLookup.get(brandFilter) || 'Brand';
  }, [brandFilter, brandLookup]);

  const renderCard = (property: PortfolioProperty, index: number) => (
    <motion.article
      key={property.id}
      className="portfolio-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
    >
      <div className="portfolio-card-media">
        <img src={getPropertyImage(property)} alt={property.title} />
        <div className="portfolio-card-overlay" />

        <div className="portfolio-card-topline">
          <span className="portfolio-status-chip">{statusLabelMap[property.status]}</span>
          <span className="portfolio-brand-chip">{property.brand?.name || brandLookup.get(property.brandId) || 'Brand'}</span>
        </div>
      </div>

      <div className="portfolio-card-body">
        <h3>{property.title}</h3>
        <p className="portfolio-card-location">
          {property.city}, {property.state}, USA
        </p>
        <p className="portfolio-card-copy">{property.shortDescription}</p>

        <Link to={`/portfolio/${property.slug}`} className="portfolio-card-link">
          View Property Details
          <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </motion.article>
  );

  return (
    <div className="page-wrapper inner-page-padding portfolio-page">
      <div className="container section-padding">
        <motion.div
          className="portfolio-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="portfolio-eyebrow">Portfolio</p>
          <h1>Hospitality Properties</h1>
          <p>
            Filter by hotel brand and project status to explore active developments and completed
            hospitality destinations.
          </p>
        </motion.div>

        <section className="portfolio-filter-panel">
          <div className="portfolio-filter-row">
            <p className="portfolio-filter-title">Hotel Brand</p>
            <div className="portfolio-chip-group" role="tablist" aria-label="Brand filters">
              <button
                type="button"
                className={`portfolio-chip ${brandFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setBrandFilter('ALL')}
              >
                All Brands
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  className={`portfolio-chip ${brandFilter === brand.id ? 'active' : ''}`}
                  onClick={() => setBrandFilter(brand.id)}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>

          <div className="portfolio-filter-row">
            <p className="portfolio-filter-title">Project Status</p>
            <div className="portfolio-chip-group" role="tablist" aria-label="Status filters">
              {statusOptions.map((status) => (
                <button
                  type="button"
                  key={status}
                  className={`portfolio-chip ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'ALL' ? 'All Statuses' : statusLabelMap[status]}
                </button>
              ))}
            </div>
          </div>

          <div className="portfolio-filter-meta">
            <span>
              Showing <strong>{filteredProperties.length}</strong> property(ies)
            </span>
            <span>
              Brand: <strong>{selectedBrandName}</strong>
            </span>
          </div>
        </section>

        {statusFilter === 'ALL' ? (
          visibleStatusSections.length === 0 ? (
            <div className="portfolio-empty-card">
              No properties match the selected brand and status filters.
            </div>
          ) : (
            <div className="portfolio-status-sections">
              {visibleStatusSections.map((statusKey) => (
                <section key={statusKey} className="portfolio-status-section">
                  <div className="portfolio-status-head">
                    <h2>{statusLabelMap[statusKey]}</h2>
                    <span>{groupedByStatus[statusKey].length} item(s)</span>
                  </div>

                  <div className="portfolio-grid">
                    {groupedByStatus[statusKey].map((property, index) =>
                      renderCard(property, index),
                    )}
                  </div>
                </section>
              ))}
            </div>
          )
        ) : filteredProperties.length === 0 ? (
          <div className="portfolio-empty-card">
            No properties match the selected brand and status filters.
          </div>
        ) : (
          <div className="portfolio-grid">
            {filteredProperties.map((property, index) => renderCard(property, index))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
