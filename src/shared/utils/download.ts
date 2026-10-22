// Saves text as a file on the user's device (used for demo downloads and license certificates).
export const downloadTextFile = (fileName: string, content: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

// "Ramadan Kareem Intro" -> "ramadan-kareem-intro". Keeps Arabic letters.
export const toFileName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'download';
