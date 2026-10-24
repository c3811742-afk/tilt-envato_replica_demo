import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';
import { AsyncContent, Divider, HoverMenu, Icon, Stack, Text, TextLink } from '@/shared/components';
import { routes, searchPath } from '@/shared/constants';
import { useCategories, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatNumber } from '@/shared/utils';
import styles from './CategoriesMenu.module.css';

interface CategoriesMenuProps {
  trigger: ReactNode; // the header's "Categories" link, which still opens the categories page
}

// The header's categories list: opens on hover, and each category opens its items in search.
export const CategoriesMenu = ({ trigger }: CategoriesMenuProps) => {
  const { text, locale } = useLocale();
  const categories = useCategories(); // loaded with the header, so the list is ready on the first hover

  return (
    <HoverMenu trigger={trigger} label={text.nav.categories} width={vars.sizes.categoryMenu.width}>
      {(close) => (
        <Stack gap={vars.spacing[3]}>
          <AsyncContent state={categories} minHeight={vars.sizes.stateMessage.compactMinHeight}>
            {(data) => (
              <ul className={styles.list}>
                {data.map((category) => {
                  const colors = vars.accentPairs[category.accent];
                  const iconStyle = { '--category-bg': colors.bg, '--category-color': colors.text } as CSSProperties;
                  return (
                    <li key={category.id}>
                      <Link to={searchPath({ category: category.id })} className={styles.link} onClick={close}>
                        <span className={styles.icon} style={iconStyle}>
                          <Icon name={category.icon} size={vars.sizes.icon.sm} />
                        </span>
                        <Stack gap={vars.spacing[0]}>
                          <Text as="span" variant="title">
                            {text.categories[category.id].name}
                          </Text>
                          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
                            {fillText(text.categoriesPage.itemCount, { count: formatNumber(category.itemCount, locale) })}
                          </Text>
                        </Stack>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </AsyncContent>
          <Divider />
          <TextLink to={routes.categories} variant="bodySm">
            {text.search.allCategories}
          </TextLink>
        </Stack>
      )}
    </HoverMenu>
  );
};
