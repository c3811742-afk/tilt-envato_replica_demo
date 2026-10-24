import { useAdminSession } from '@/features/admin/hooks';
import { Divider, Dropdown, Icon, Select, Stack, Text, TextLink } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import styles from './AdminAccountMenu.module.css';
import { fillText, isolate } from '@/shared/utils';

// The signed-in admin: who they are, their role, the demo switch between admins, and a way back to the site.
export const AdminAccountMenu = () => {
  const { text } = useLocale();
  const { admins, currentAdmin, switchAdmin } = useAdminSession();
  const t = text.admin.layout;

  return (
    <Dropdown
      label={text.admin.topBar.accountMenu}
      trigger={
        <>
          <Icon name="user" size={vars.sizes.icon.sm} />
          <span className={styles.name} dir="auto">
            {currentAdmin.name}
          </span>
        </>
      }
    >
      <Stack gap={vars.spacing[3]}>
        <Stack gap={vars.spacing[1]}>
          <Text variant="title" autoDirection maxLines={1}>
            {currentAdmin.name}
          </Text>
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {text.admin.roles[currentAdmin.role]}
          </Text>
        </Stack>
        <Divider />
        <Select
          label={t.signedInAs}
          value={currentAdmin.id}
          options={admins.map((admin) => ({
            value: admin.id,
            label: fillText(t.adminOption, { name: isolate(admin.name), role: text.admin.roles[admin.role] }),
          }))}
          onChange={switchAdmin}
        />
        <Divider />
        <TextLink to={routes.home} variant="bodySm" underline={false}>
          {text.admin.topBar.viewSite}
        </TextLink>
      </Stack>
    </Dropdown>
  );
};
