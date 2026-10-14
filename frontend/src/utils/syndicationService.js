/**
 * Multi-Channel Job Board Syndication & SEO Service
 * Manages job distribution to LinkedIn, Indeed, Google for Jobs, and Social Channels.
 */

const STORAGE_KEY = 'ats_job_syndications';

const DEFAULT_CHANNELS = [
  { id: 'google_jobs', name: 'Google for Jobs', logo: '🔍', status: 'ACTIVE', candidateReach: 'Global / Search' },
  { id: 'linkedin', name: 'LinkedIn Job Network', logo: '💼', status: 'ACTIVE', candidateReach: '850M+ Professionals' },
  { id: 'indeed', name: 'Indeed Sponsored & Organic', logo: '🌐', status: 'ACTIVE', candidateReach: '250M+ Job Seekers' },
  { id: 'ziprecruiter', name: 'ZipRecruiter Partner Network', logo: '⚡', status: 'PENDING', candidateReach: '100+ Job Sites' },
  { id: 'glassdoor', name: 'Glassdoor Jobs & Culture', logo: '🏢', status: 'ACTIVE', candidateReach: '55M+ Reviews & Jobs' }
];

export function getStoredSyndications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveStoredSyndications(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save syndications:', e);
  }
}

export const syndicationService = {
  // Retrieve channel sync status for a job
  getJobChannels: (jobId) => {
    const all = getStoredSyndications();
    if (!all[jobId]) {
      all[jobId] = DEFAULT_CHANNELS.map(ch => ({ ...ch, lastSynced: 'Just now' }));
      saveStoredSyndications(all);
    }
    return all[jobId];
  },

  // Toggle channel distribution state
  toggleChannel: (jobId, channelId) => {
    const all = getStoredSyndications();
    const list = all[jobId] || DEFAULT_CHANNELS.map(ch => ({ ...ch, lastSynced: 'Just now' }));
    const idx = list.findIndex(c => c.id === channelId);
    if (idx !== -1) {
      list[idx].status = list[idx].status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      list[idx].lastSynced = 'Just now';
      all[jobId] = list;
      saveStoredSyndications(all);
    }
    return list;
  },

  // Generate Google for Jobs JSON-LD schema
  generateGoogleJsonLd: (job) => {
    const minSalary = Number(String(job.salaryMin || job.salary || 100000).replace(/[^0-9]/g, '')) || 100000;
    const maxSalary = Number(String(job.salaryMax || job.salary || 140000).replace(/[^0-9]/g, '')) || 140000;

    return {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title || 'Software Professional',
      description: job.description || 'Join our high-growth engineering and operations team.',
      identifier: {
        '@type': 'PropertyValue',
        name: job.company || job.client || 'HirebridgeHR Client',
        value: job.jobId || job.id || 'REQ-01'
      },
      datePosted: job.createdAt || new Date().toISOString(),
      validThrough: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      employmentType: (job.employmentType || 'FULL_TIME').toUpperCase().replace(/\s+/g, '_'),
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company || job.client || 'Apex Global Tech',
        sameAs: 'https://hirebridgehr.com'
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location || 'San Francisco',
          addressRegion: 'CA',
          addressCountry: 'US'
        }
      },
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: job.currency || 'USD',
        value: {
          '@type': 'QuantitativeValue',
          minValue: minSalary,
          maxValue: maxSalary,
          unitText: (job.salaryPeriod || 'YEAR').toUpperCase()
        }
      }
    };
  },

  // Social share link generators
  getShareLinks: (job, publicUrl) => {
    const title = encodeURIComponent(`We are hiring: ${job.title} at ${job.company || 'Apex Global Tech'}!`);
    const encodedUrl = encodeURIComponent(publicUrl);

    return {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${encodedUrl}&hashtags=hiring,jobs,careers`,
      whatsapp: `https://api.whatsapp.com/send?text=${title}%20${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(`Job Opening: ${job.title}`)}&body=${encodeURIComponent(`Check out this open position:\n\n${job.title}\n${publicUrl}`)}`
    };
  },

  // Embeddable careers widget HTML snippet
  generateEmbedSnippet: (jobId, companyName) => {
    return `<div id="hirebridge-job-widget" data-job-id="${jobId}"></div>\n<script src="https://hirebridgehr.com/widget.js" async></script>`;
  }
};

export default syndicationService;
