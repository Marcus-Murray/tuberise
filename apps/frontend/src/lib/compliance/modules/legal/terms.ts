/**
 * Terms of Service Management Module
 * Simple terms of service utilities
 */

export interface TermsSection {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
}

/**
 * Get terms of service sections
 */
export function getTermsSections(): TermsSection[] {
  return [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      content:
        'By using Tuberise Analytics, you agree to be bound by these terms and conditions.',
      lastUpdated: '2024-12-06',
    },
    {
      id: 'service-description',
      title: 'Service Description',
      content:
        'Tuberise Analytics provides YouTube channel analytics, AI-powered insights, and Notion integration services.',
      lastUpdated: '2024-12-06',
    },
    {
      id: 'user-obligations',
      title: 'User Obligations',
      content:
        'Users must provide accurate information, respect API rate limits, and use the service in compliance with YouTube and Notion terms.',
      lastUpdated: '2024-12-06',
    },
    {
      id: 'api-usage',
      title: 'API Usage',
      content:
        'Users are responsible for complying with YouTube Data API and Notion API terms of service and usage limits.',
      lastUpdated: '2024-12-06',
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      content:
        'Tuberise Analytics is provided "as is" without warranties. We are not liable for indirect damages or service interruptions.',
      lastUpdated: '2024-12-06',
    },
    {
      id: 'termination',
      title: 'Termination',
      content:
        'We may terminate accounts for violations of these terms. Users may cancel their subscription at any time.',
      lastUpdated: '2024-12-06',
    },
  ];
}

/**
 * Generate terms of service HTML
 */
export function generateTermsHTML(): string {
  const sections = getTermsSections();

  let html = '<div class="terms-of-service">';
  html += '<h1>Terms of Service</h1>';
  html += '<p>Last updated: December 6, 2024</p>';

  sections.forEach(section => {
    html += `<section id="${section.id}">`;
    html += `<h2>${section.title}</h2>`;
    html += `<p>${section.content}</p>`;
    html += `<p><small>Last updated: ${section.lastUpdated}</small></p>`;
    html += '</section>';
  });

  html += '</div>';
  return html;
}

/**
 * Check if user has accepted current terms
 */
export function checkTermsAcceptance(userAcceptedVersion: string): boolean {
  const currentVersion = '1.0';
  return userAcceptedVersion === currentVersion;
}
