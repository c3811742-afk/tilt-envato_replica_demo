import { useState } from 'react';
import { Badge, Button, Card, Checkbox, FieldMessage, Icon, Modal, ModalActions, PhoneField, Section, Select, Stack, Text, TextField } from '@/shared/components';
import { card, paymentMethodIcons, savedPaymentKinds, type SavedPaymentKind } from '@/shared/constants';
import { useAccountAction, useForm, useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { SavedPaymentMethod } from '@/shared/types';
import { billingApi, fillText, formatCardNumber, formatExpiry, validateCardNumber, validateEgyptianMobile, validateExpiry, validateInstapay, validateRequired } from '@/shared/utils';

const isCard = (kind: SavedPaymentKind) => kind === 'card' || kind === 'meeza';

// Saved payment methods: renewals and plan changes are charged to the default one.
export const PaymentMethods = ({ methods }: { methods: SavedPaymentMethod[] }) => {
  const { text } = useLocale();
  const [editing, setEditing] = useState<SavedPaymentMethod | 'new' | null>(null);
  const [removing, setRemoving] = useState<SavedPaymentMethod | null>(null);
  const { run, busy, error } = useAccountAction();

  return (
    <Section title={text.billingPage.methodsTitle} variant="h3" gap={vars.spacing[3]}>
      {methods.length === 0 ? (
        <Text color={vars.colors.textMuted}>{text.billingPage.methodsEmpty}</Text>
      ) : (
        <Stack as="ul" gap={vars.spacing[3]}>
          {methods.map((method) => (
            <Card key={method.id} as="li" padding={vars.spacing[4]} gap={vars.spacing[3]}>
              <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[3]}>
                <Stack direction="row" align="center" gap={vars.spacing[3]}>
                  <Icon name={paymentMethodIcons[method.kind]} />
                  <Stack gap={vars.spacing[1]}>
                    <Text as="span" variant="title">
                      {text.billingPage.kinds[method.kind]} <bdi>{method.summary}</bdi>
                    </Text>
                    {method.expiry && (
                      <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
                        {fillText(text.billingPage.expires, { date: method.expiry })}
                      </Text>
                    )}
                  </Stack>
                </Stack>
                {method.isDefault && <Badge variant="info">{text.billingPage.defaultBadge}</Badge>}
              </Stack>
              <Stack direction="row" wrap gap={vars.spacing[2]}>
                {!method.isDefault && (
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => void run(() => billingApi.setDefaultPaymentMethod(method.id))}>
                    {text.billingPage.makeDefault}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setEditing(method)}>
                  <Icon name="pencil" size={vars.sizes.icon.sm} />
                  {text.billingPage.edit}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRemoving(method)}>
                  <Icon name="trash" size={vars.sizes.icon.sm} />
                  {text.billingPage.remove}
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
      <FieldMessage tone="error" message={error} />
      <div>
        <Button variant="secondary" onClick={() => setEditing('new')}>
          <Icon name="plus" size={vars.sizes.icon.sm} />
          {text.billingPage.addMethod}
        </Button>
      </div>

      {editing && <MethodDialog method={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {removing && (
        <Modal
          open
          onClose={() => setRemoving(null)}
          title={text.billingPage.removeTitle}
          actions={
            <ModalActions
              confirmLabel={text.billingPage.remove}
              tone="danger"
              busy={busy}
              onCancel={() => setRemoving(null)}
              onConfirm={() => void run(() => billingApi.removePaymentMethod(removing.id)).then((ok) => ok && setRemoving(null))}
            />
          }
        >
          <Text>
            {text.billingPage.kinds[removing.kind]} <bdi>{removing.summary}</bdi>
          </Text>
          <Text color={vars.colors.textMuted}>{text.billingPage.removeText}</Text>
        </Modal>
      )}
    </Section>
  );
};

type MethodValues = {
  kind: SavedPaymentKind;
  cardNumber: string;
  holder: string;
  expiry: string;
  phone: string;
  address: string;
  makeDefault: boolean;
};

// Adds a payment method, or edits what can change on a saved one (the card's name and expiry, the wallet number, the InstaPay address).
const MethodDialog = ({ method, onClose }: { method: SavedPaymentMethod | null; onClose: () => void }) => {
  const { text } = useLocale();
  const { setAccount } = useSession();
  const adding = method === null;
  const only =
    (kinds: SavedPaymentKind[], validate: (value: string) => ReturnType<typeof validateRequired>, onlyWhenAdding = false) =>
    (value: string, values: MethodValues) =>
      kinds.includes(values.kind) && (adding || !onlyWhenAdding) ? validate(value) : null;
  const form = useForm<MethodValues>(
    {
      kind: method?.kind ?? 'card',
      cardNumber: '',
      holder: method?.holder ?? '',
      expiry: method?.expiry ?? '',
      phone: method?.kind === 'wallet' ? method.summary : '',
      address: method?.kind === 'instapay' ? method.summary : '',
      makeDefault: false,
    },
    {
      cardNumber: only(['card', 'meeza'], validateCardNumber, true),
      holder: only(['card', 'meeza'], validateRequired),
      expiry: only(['card', 'meeza'], (value) => validateExpiry(value)),
      phone: only(['wallet'], validateEgyptianMobile),
      address: only(['instapay'], validateInstapay),
    },
  );
  const { kind } = form.values;

  const submit = form.submit(async (values) => {
    const details = { holder: values.holder, expiry: values.expiry, phone: values.phone, address: values.address };
    setAccount(
      adding
        ? await billingApi.addPaymentMethod({ kind: values.kind, cardNumber: values.cardNumber, makeDefault: values.makeDefault, ...details })
        : await billingApi.editPaymentMethod(method.id, details),
    );
    onClose();
  });

  return (
    <Modal open onClose={onClose} title={adding ? text.billingPage.addMethod : text.billingPage.editMethod}>
      <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
        {adding && (
          <Select
            label={text.billingPage.kindLabel}
            value={kind}
            onChange={(value) => form.setValue('kind', value as SavedPaymentKind)}
            options={savedPaymentKinds.map((option) => ({ value: option, label: text.billingPage.kinds[option] }))}
          />
        )}
        {isCard(kind) && (
          <>
            {adding && (
              <>
                <TextField
                  label={text.checkout.cardNumber}
                  inputMode="numeric"
                  direction="ltr"
                  autoComplete="cc-number"
                  placeholder={card.demoNumber}
                  hint={fillText(text.checkout.testCards, { number: card.demoNumber, declined: card.declinedNumber })}
                  {...form.field('cardNumber')}
                  onChange={(value) => form.setValue('cardNumber', formatCardNumber(value))}
                />
              </>
            )}
            <TextField label={text.checkout.cardName} autoComplete="cc-name" {...form.field('holder')} />
            <TextField
              label={text.checkout.expiry}
              inputMode="numeric"
              direction="ltr"
              placeholder={text.checkout.expiryPlaceholder}
              autoComplete="cc-exp"
              {...form.field('expiry')}
              onChange={(value) => form.setValue('expiry', formatExpiry(value))}
            />
          </>
        )}
        {kind === 'wallet' && <PhoneField label={text.checkout.walletPhone} {...form.field('phone')} />}
        {kind === 'instapay' && (
          <TextField label={text.checkout.instapayAddress} direction="ltr" placeholder={text.checkout.instapayPlaceholder} {...form.field('address')} />
        )}
        {adding && <Checkbox label={text.billingPage.makeDefault} checked={form.values.makeDefault} onChange={(checked) => form.setValue('makeDefault', checked)} />}
        <FormFooterRow submitting={form.submitting} requestError={form.requestError} onCancel={onClose} />
      </Stack>
    </Modal>
  );
};

const FormFooterRow = ({ submitting, requestError, onCancel }: { submitting: boolean; requestError: unknown; onCancel: () => void }) => {
  const { text } = useLocale();
  const { requestError: explain } = useMessages();
  return (
    <Stack gap={vars.spacing[3]}>
      <FieldMessage tone="error" message={requestError ? explain(requestError) : undefined} />
      <ModalActions confirmLabel={text.common.saveChanges} submit busy={submitting} onCancel={onCancel} />
    </Stack>
  );
};
