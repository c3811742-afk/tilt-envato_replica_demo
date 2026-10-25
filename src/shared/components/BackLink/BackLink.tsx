import { Link, useLocation, useNavigate } from 'react-router';
import { routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { Icon } from '../Icon';
import type { BackLinkProps } from './BackLink.types';
import styles from './BackLink.module.css';

// "‹ Back" above a page's title, in muted grey. With `to` it opens that page; otherwise it goes back in the
// browser's history, or to the home page when this is the first page of the visit (a shared link, a new tab).
export const BackLink = ({ to, label }: BackLinkProps) => {
  const { text } = useLocale();
  const navigate = useNavigate();
  const { key } = useLocation();
  const content = (
    <>
      <Icon name="chevronStart" size={vars.sizes.icon.sm} />
      <span dir="auto">{label ?? text.common.back}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={styles.backLink}>
        {content}
      </Link>
    );
  }
  // React Router gives the first page of a visit the key "default": there's nothing before it in the app.
  const firstPage = key === 'default';
  return (
    <button type="button" className={styles.backLink} onClick={() => (firstPage ? navigate(routes.home) : navigate(-1))}>
      {content}
    </button>
  );
};
