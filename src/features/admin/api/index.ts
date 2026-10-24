// Mock admin API. Every function is async and can fail, like a real server.
export { fetchAdmins, createAdmin, changeAdminRole } from './adminsApi';
export {
  fetchReviewQueue,
  fetchElement,
  fetchLiveElements,
  reviewElement,
  flagElement,
  unpublishElement,
} from './elementsApi';
export { fetchAuditLog } from './auditApi';
export {
  fetchCategories,
  fetchCategory,
  createCategory,
  renameCategory,
  moveCategory,
  setCategoryHidden,
  saveAttribute,
  removeAttribute,
  moveAttribute,
  fetchTags,
  renameTag,
  mergeTags,
  setTagBanned,
  fetchUnusedElements,
  deprecateElement,
} from './catalogApi';
export {
  fetchFeatured,
  fetchCollections,
  addFeatured,
  removeFeatured,
  moveFeatured,
  fetchOccasions,
  saveOccasion,
  deleteOccasion,
  fetchFreeElements,
  saveFreeElements,
  fetchBanners,
  saveBanner,
  deleteBanner,
} from './homepageApi';
export { fetchNoClickSearches, fetchSearchReports, closeSearchReport } from './searchApi';
export {
  fetchFaqs,
  saveFaq,
  deleteFaq,
  moveFaq,
  fetchLegalPages,
  saveLegalPage,
  fetchArticles,
  saveArticle,
  deleteArticle,
} from './contentApi';
export { fetchLanguages, addLanguage, fetchTranslations, saveTranslation } from './languagesApi';
export {
  fetchAudienceSizes,
  fetchAnnouncements,
  sendAnnouncement,
  cancelAnnouncement,
  fetchNewsletters,
  sendNewsletter,
} from './messagesApi';
export { fetchPrograms, saveProgram } from './programsApi';
export { fetchDashboard } from './dashboardApi';
export { fetchPlans, savePlan, fetchPromoCodes, createPromoCode, disablePromoCode } from './plansApi';
export {
  fetchTransactions,
  refundTransaction,
  fetchFailedPayments,
  fetchSubscriptions,
  cancelSubscription,
} from './billingApi';
export { fetchPayoutRules, savePayoutRules, fetchPayouts, decidePayout, exportReport } from './payoutsApi';
export { fetchInvoices, fetchUninvoicedTransactions, issueInvoice } from './invoicesApi';
export { fetchLicenses, findLicense, revokeLicense, fetchClaims, decideClaim } from './licensesApi';
export {
  fetchTickets,
  fetchTicket,
  replyToTicket,
  setTicketClosed,
  fetchItemReports,
  resolveItemReport,
} from './supportApi';
export {
  fetchAiTools,
  saveAiTools,
  fetchGenerationCosts,
  saveGenerationCosts,
  fetchContentRules,
  saveContentRules,
} from './aiApi';
export { AdminApiError, adminErrorCode } from './errors';
export type { AdminErrorCode } from './errors';
