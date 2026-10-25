// Blog posts are filtered by these topics.
export const blogTopics = ['design', 'video', 'music', 'business', 'news'] as const;
export type BlogTopic = (typeof blogTopics)[number];

// Courses and tutorials, from first steps to advanced.
export const courseLevels = ['beginner', 'intermediate', 'advanced'] as const;
export type CourseLevel = (typeof courseLevels)[number];

// Open jobs are grouped by team.
export const jobTeams = ['engineering', 'design', 'content', 'support'] as const;
export type JobTeam = (typeof jobTeams)[number];

// Company pages, in the order of their tabs.
export const companyPages = ['about', 'products', 'careers', 'news'] as const;
export type CompanyPage = (typeof companyPages)[number];

// Partner programs anyone can apply to.
export const partnerPrograms = ['affiliate', 'creative'] as const;
export type PartnerProgram = (typeof partnerPrograms)[number];

// Audience sizes on the partner application.
export const partnerAudiences = ['small', 'medium', 'large'] as const;
export type PartnerAudience = (typeof partnerAudiences)[number];

// When the license terms and the fair use policy last changed.
export const licenseTermsUpdatedAt = '2026-10-01';
export const fairUseUpdatedAt = '2026-10-01';

// The brand's social media pages. Replace `socialHandle` with the brand's handle on each platform.
const socialHandle = '';
export const socialPlatforms = ['instagram', 'facebook', 'youtube', 'tiktok', 'linkedin', 'x'] as const;
export type SocialPlatform = (typeof socialPlatforms)[number];
export const socialLinks: Record<SocialPlatform, string> = {
  instagram: `https://www.instagram.com/${socialHandle}`,
  facebook: `https://www.facebook.com/${socialHandle}`,
  youtube: `https://www.youtube.com/${socialHandle ? `@${socialHandle}` : ''}`,
  tiktok: `https://www.tiktok.com/${socialHandle ? `@${socialHandle}` : ''}`,
  linkedin: `https://www.linkedin.com/company/${socialHandle}`,
  x: `https://x.com/${socialHandle}`,
};

// Where job applications go. Replace with the company's careers address.
export const careersEmail = 'careers@example.com';
