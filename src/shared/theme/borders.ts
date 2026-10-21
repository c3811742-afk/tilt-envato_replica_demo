export const borderWidth = {
  none: '0',
  thin: '0.125rem', // 2
  thick: '0.1875rem', // 3
} as const;

export const borderStyle = 'solid';

export const borders = { width: borderWidth, style: borderStyle } as const;
