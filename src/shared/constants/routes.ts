export const routes = {
  home: '/',
  admin: '/admin',
  adminReview: '/admin/review',
  adminReviewElement: '/admin/review/:elementId',
  adminLiveElements: '/admin/elements',
  adminAdmins: '/admin/admins',
  adminAuditLog: '/admin/audit-log',
  notFound: '*', // any path that matches no other route
} as const;
