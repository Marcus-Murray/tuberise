/**
 * Privacy Policy Management Module
 * Simple privacy policy utilities
 */

export interface PrivacyPolicySection {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
}

/**
 * Get privacy policy sections
 */
export function getPrivacyPolicySections(): PrivacyPolicySection[] {
  return [
    {
      id: 'data-collection',
      title: 'Data Collection',
      content:
        'We collect data necessary to provide YouTube analytics services, including channel information, video metrics, and user preferences.',
      lastUpdated: '2024-12-06',
    },
    {
      id: 'data-usage',
      title: 'Data Usage',
      content:
        'Your data is used to generate analytics insights, provide AI-powered recommendations, and improve our services.',
      lastUpdated: '2024-12-06',
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing',
      content:
        'We do not sell your personal data. Data may be shared with trusted third-party services (YouTube, Notion) as necessary for service functionality.',
      lastUpdated: '2024-12-06',
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      content:
        'We retain your data for as long as your account is active. You can request data deletion at any time.',
      lastUpdated: '2024-12-06',
    },
    {
      id: 'user-rights',
      title: 'Your Rights',
      content:
        'You have the right to access, rectify, erase, and port your data. You can also object to processing and withdraw consent.',
      lastUpdated: '2024-12-06',
    },
  ];
}

/**
 * Generate privacy policy HTML
 */
export function generatePrivacyPolicyHTML(): string {
  const sections = getPrivacyPolicySections();

  let html = '<div class="privacy-policy">';
  html += '<h1>Privacy Policy</h1>';
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
 * Check if privacy policy has been updated
 */
export function checkPrivacyPolicyUpdates(
  userAcceptedVersion: string
): boolean {
  const currentVersion = '1.0';
  return userAcceptedVersion !== currentVersion;
}
