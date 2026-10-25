import { Badge, Card, EmptyState, Stack, Text, TextLink } from '@/shared/components';
import { revokeReasons, type RevokeReason } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Alert, PlanId } from '@/shared/types';
import { fillText, formatDate, isolate } from '@/shared/utils';

const dateTimeFormat: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

const isRevokeReason = (value: string): value is RevokeReason => (revokeReasons as readonly string[]).includes(value);

// Account notifications: renewal reminders, failed payments, removed items, revoked licenses and new items
// from followed creators. Those unread when the page opened are marked "New".
export const AlertsList = ({ alerts, unread }: { alerts: Alert[]; unread: string[] }) => {
  const { text, locale, price } = useLocale();

  if (!alerts.length) return <EmptyState title={text.notifications.tabs.alerts} message={text.alerts.empty} />;

  // A rejected creator application: the admin team's reason, in the active language.
  const applicationReason = (reason: string) => {
    const reasons: Record<string, string> = text.admin.creators.applicationReasons;
    return reasons[reason] ?? reasons.other;
  };

  // Each kind fills its text with its own details, in the active language.
  const message = ({ kind, params }: Alert) => {
    switch (kind) {
      case 'renewalReminder':
      case 'planEnding':
        return fillText(text.alerts[kind], {
          plan: text.pricing.plans[params.plan as PlanId]?.name ?? '',
          date: formatDate(params.date, locale),
          price: price(Number(params.total)),
        });
      case 'licenseRevoked':
        return fillText(text.alerts.licenseRevoked, { title: params.title, reason: isRevokeReason(params.reason) ? text.revokeReasons[params.reason] : '' });
      case 'reportAnswered': {
        const outcomes: Record<string, string> = text.alerts.reportOutcomes;
        return fillText(text.alerts.reportAnswered, { title: params.title, outcome: outcomes[params.outcome] ?? '' });
      }
      case 'creatorRejected':
        return fillText(text.alerts.creatorRejected, { reason: applicationReason(params.reason) });
      case 'elementUnpublished': {
        const reasons: Record<string, string> = text.admin.unpublishReasons;
        return fillText(text.alerts.elementUnpublished, { title: params.title, reason: reasons[params.reason] ?? params.reason });
      }
      case 'occasionReminder': {
        const occasions: Record<string, string> = text.studio.occasions;
        return fillText(text.alerts.occasionReminder, { occasion: occasions[params.occasion] ?? '', date: formatDate(params.date, locale) });
      }
      // The team writes these in either language: each part keeps its own direction.
      case 'announcement':
        return fillText(text.alerts.announcement, { title: isolate(params.title), message: isolate(params.message) });
      case 'payoutPaid':
      case 'payoutRejected':
        return fillText(text.alerts[kind], { amount: price(Number(params.amount)) });
      case 'identityRejected': {
        const reasons: Record<string, string> = text.admin.creators.idReasons;
        return fillText(text.alerts.identityRejected, { reason: reasons[params.reason] ?? params.reason });
      }
      default:
        return fillText(text.alerts[kind], params);
    }
  };

  return (
    <Stack as="ul" gap={vars.spacing[3]}>
      {alerts.map((alert) => (
        <Card key={alert.id} as="li" gap={vars.spacing[2]}>
          <Stack direction="row" align="flex-start" justify="space-between" gap={vars.spacing[2]}>
            {alert.link ? (
              <TextLink to={alert.link} variant="title" underline={false}>
                <span dir="auto">{message(alert)}</span>
              </TextLink>
            ) : (
              <Text variant="title" autoDirection>
                {message(alert)}
              </Text>
            )}
            {unread.includes(alert.id) && <Badge variant="highlight">{text.notifications.newBadge}</Badge>}
          </Stack>
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {formatDate(alert.createdAt, locale, dateTimeFormat)}
          </Text>
        </Card>
      ))}
    </Stack>
  );
};
