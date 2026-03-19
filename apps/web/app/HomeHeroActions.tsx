'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

const CTA_ITEMS = [
  {
    href: '#quick-search',
    label: 'Search 4M+ Records',
    className: 'landing-hero-button landing-hero-button-primary',
    ctaId: 'hero_search',
  },
  {
    href: '/plan',
    label: 'Start My Free Plan',
    className: 'landing-hero-button landing-hero-button-secondary',
    ctaId: 'hero_plan',
  },
];

export default function HomeHeroActions() {
  return (
    <div className="landing-hero-actions-wrap">
      <div className="landing-hero-actions">
        {CTA_ITEMS.map((cta) => (
          <Link
            key={cta.href}
            href={cta.href}
            className={cta.className}
            onClick={() => trackEvent('home_cta_clicked', { cta_id: cta.ctaId, destination: cta.href })}
          >
            {cta.label}
          </Link>
        ))}
      </div>
      <a
        href="#lead-capture"
        className="landing-inline-link"
        onClick={() => trackEvent('home_cta_clicked', { cta_id: 'hero_alerts_anchor', destination: '#lead-capture' })}
      >
        Prefer email updates? Join the free sponsor alerts list.
      </a>
    </div>
  );
}
