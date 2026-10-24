import { useState } from "react";
import { BillingAddressFields, Stack } from "@/shared/components";
import { useForm, useLocale, useMessages, useSession } from "@/shared/hooks";
import { vars } from "@/shared/theme";
import { authApi, isGovernorate, validateRequired } from "@/shared/utils";
import { SettingsForm } from "../SettingsForm";
import { useSignedInUser } from "../useSignedInUser";
import { Invoices } from "./billing/Invoices";
import { PaymentMethods } from "./billing/PaymentMethods";

// Billing: saved payment methods, every invoice, and the billing address ("Choose my governorate").
export const BillingSettings = () => {
  const { text } = useLocale();
  const { fieldError } = useMessages();
  const { setAccount } = useSession();
  const user = useSignedInUser();
  const [saved, setSaved] = useState(false);
  const form = useForm(
    {
      governorate: user.billingAddress?.governorate ?? "",
      city: user.billingAddress?.city ?? "",
      street: user.billingAddress?.street ?? "",
    },
    {
      governorate: validateRequired,
      city: validateRequired,
      street: validateRequired,
    },
  );

  return (
    <Stack gap={vars.spacing[8]}>
      <PaymentMethods methods={user.paymentMethods} />
      <Invoices invoices={user.invoices} />
      <SettingsForm
        title={text.billingPage.addressTitle}
        intro={text.account.billing.intro}
        saved={saved}
        submitting={form.submitting}
        requestError={form.requestError}
        onSubmit={form.submit(async ({ governorate, city, street }) => {
          if (!isGovernorate(governorate)) return; // already checked by the form
          setAccount(
            await authApi.updateBillingAddress({
              governorate,
              city: city.trim(),
              street: street.trim(),
            }),
          );
          setSaved(true);
        })}
      >
        <BillingAddressFields
          values={form.values}
          errors={{
            governorate: fieldError(form.errors.governorate),
            city: fieldError(form.errors.city),
            street: fieldError(form.errors.street),
          }}
          onChange={(name, value) => form.setValue(name, value)}
        />
      </SettingsForm>
    </Stack>
  );
};
