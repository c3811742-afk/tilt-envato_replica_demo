import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router';
import { Button, FieldMessage, Stack, Text } from '@/shared/components';
import { tourScroll, tourStepPlaces, tourSteps, tourTargetWaitMs } from '@/shared/constants';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { authApi, cx, fillText, formatNumber, safeAsync } from '@/shared/utils';
import styles from './SiteTour.module.css';

interface Box {
  top: number;
  bottom: number;
  start: number; // from the start of the line: the left in English, the right in Arabic
  width: number;
  height: number;
}

const percent = 100;

// The part of an element that is on screen, measured from the start of the reading direction.
const boxOf = (element: Element): Box => {
  const rect = element.getBoundingClientRect();
  const rtl = getComputedStyle(document.documentElement).direction === 'rtl';
  const top = Math.max(rect.top, 0);
  const bottom = Math.min(rect.bottom, window.innerHeight);
  return {
    top,
    bottom,
    start: rtl ? window.innerWidth - rect.right : rect.left,
    width: rect.width,
    height: Math.max(bottom - top, 0),
  };
};

// Brings an element into view near the top of the screen, so the card fits under it.
// (Elements in the sticky header don't move; the page just scrolls.)
const showElement = (element: Element) => {
  window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - window.innerHeight * tourScroll.topShare });
};

// A CSS length read from a style ("1rem") in pixels, to compare with measured sizes.
const toPixels = (length: string) => {
  const value = parseFloat(length) || 0;
  return length.trim().endsWith('rem') ? value * parseFloat(getComputedStyle(document.documentElement).fontSize) : value;
};

type CardPlace = 'below' | 'above' | 'inside';

// The card goes under the element if it fits, else above it, else on top of it at the bottom of the screen.
const placeCard = (box: Box, cardHeight: number, margin: number): CardPlace => {
  if (window.innerHeight - box.bottom >= cardHeight + margin) return 'below';
  if (box.top >= cardHeight + margin) return 'above';
  return 'inside';
};

const sameBox = (a: Box | null, b: Box | null) =>
  a === b || (a !== null && b !== null && (Object.keys(a) as (keyof Box)[]).every((key) => Math.round(a[key]) === Math.round(b[key])));

// The first of a step's targets that is on screen (a hidden element has no boxes).
const findTarget = (targets: readonly string[]) =>
  targets.map((name) => document.querySelector(`[data-tour="${name}"]`)).find((element) => element && element.getClientRects().length > 0) ?? null;

// "A registered user gets a short tour on first login": it walks through the site, opening each page and
// highlighting the real search box, filters, preview, download button, notifications and account menu.
// Skippable, shown once; at the end the user is back on the page they started on.
export const SiteTour = () => {
  const { text, locale } = useLocale();
  const { requestError } = useMessages();
  const { setAccount } = useSession();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [startPath] = useState(`${pathname}${search}`);
  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState<Element | null>(null);
  const [searching, setSearching] = useState(true);
  const [box, setBox] = useState<Box | null>(null);
  const [cardSize, setCardSize] = useState({ height: 0, margin: 0 });
  const [error, setError] = useState<unknown>(null);
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const step = tourSteps[index];
  const stepPlace = tourStepPlaces[step];
  const last = index === tourSteps.length - 1;

  // Opens the step's page, then waits for its element to appear (pages load their content).
  useEffect(() => {
    if ('path' in stepPlace && stepPlace.path !== window.location.hash.slice(1)) navigate(stepPlace.path);
    const started = performance.now();
    let frame = requestAnimationFrame(function look() {
      const found = findTarget(stepPlace.targets);
      if (found || performance.now() - started > tourTargetWaitMs) {
        if (found) {
          showElement(found);
          setBox(boxOf(found));
        }
        setTarget(found);
        setSearching(false);
        return;
      }
      frame = requestAnimationFrame(look);
    });
    return () => cancelAnimationFrame(frame);
  }, [stepPlace, navigate]);

  // Follows the element while the page scrolls or its layout changes.
  useEffect(() => {
    if (!target) return;
    let frame = requestAnimationFrame(function measure() {
      const next = boxOf(target);
      setBox((current) => (sameBox(current, next) ? current : next));
      const card = cardRef.current;
      if (card) {
        // The card's height and its gap from the element (a theme spacing, read in pixels).
        const height = card.offsetHeight;
        const margin = toPixels(getComputedStyle(card).getPropertyValue('--tour-gap'));
        setCardSize((current) => (current.height === height && current.margin === margin ? current : { height, margin }));
      }
      frame = requestAnimationFrame(measure);
    });
    return () => cancelAnimationFrame(frame);
  }, [target]);

  // Each step starts on its main action (the last button: Next or Done), so Enter moves on.
  useEffect(() => {
    if (!searching) [...(cardRef.current?.querySelectorAll('button') ?? [])].at(-1)?.focus();
  }, [searching, index]);

  const goTo = (next: number) => {
    setSearching(true);
    setTarget(null);
    setBox(null);
    setIndex(next);
  };

  // Skipping and finishing both end the tour for good.
  const finish = async () => {
    const result = await safeAsync(authApi.completeTour);
    setError(result.ok ? null : result.error);
    if (!result.ok) return;
    navigate(startPath);
    setAccount(result.data);
  };

  const shown = box && target ? box : null;
  const place = shown ? placeCard(shown, cardSize.height, cardSize.margin) : null;
  const style = shown
    ? ({
        '--spot-top': `${(shown.top / window.innerHeight) * percent}%`,
        '--spot-start': `${(shown.start / window.innerWidth) * percent}%`,
        '--spot-width': `${(shown.width / window.innerWidth) * percent}%`,
        '--spot-height': `${(shown.height / window.innerHeight) * percent}%`,
        '--card-edge': place === 'above'
          ? `${((window.innerHeight - shown.top) / window.innerHeight) * percent}%`
          : `${(shown.bottom / window.innerHeight) * percent}%`,
      } as CSSProperties)
    : undefined;

  return createPortal(
    <div className={styles.tour} style={style} onKeyDown={(event) => event.key === 'Escape' && finish()}>
      {/* Catches clicks so the page under the tour isn't used by accident. */}
      <div className={cx(styles.backdrop, !shown && styles.dimmed)} />
      {shown && <div className={styles.spotlight} />}
      {/* The card shows once the step is placed: next to its element, or centered when there is none. */}
      {!searching && (!target || box) && (
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cx(styles.card, place ? styles[place] : styles.centered, place && !cardSize.height && styles.measuring)}
        >
          <Stack gap={vars.spacing[3]}>
            <Text variant="label" color={vars.colors.textMuted}>
              {fillText(text.tour.stepOf, { current: formatNumber(index + 1, locale), total: formatNumber(tourSteps.length, locale) })}
            </Text>
            <Text as="h2" variant="h4" id={titleId}>
              {text.tour.steps[step].title}
            </Text>
            <Text>{text.tour.steps[step].text}</Text>
            <FieldMessage tone="error" message={error ? requestError(error) : undefined} />
            <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
              <Button variant="muted" size="sm" onClick={finish}>
                {text.common.skip}
              </Button>
              <Stack direction="row" gap={vars.spacing[2]}>
                {index > 0 && (
                  <Button variant="outline" size="sm" onClick={() => goTo(index - 1)}>
                    {text.common.back}
                  </Button>
                )}
                <Button size="sm" onClick={last ? finish : () => goTo(index + 1)}>
                  {last ? text.common.done : text.common.next}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </div>
      )}
    </div>,
    document.body,
  );
};

