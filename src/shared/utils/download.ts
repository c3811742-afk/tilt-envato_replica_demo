// Saves a file on the user's device (generated images, video and audio).
export const downloadFile = (fileName: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

// Saves text as a file on the user's device (used for demo downloads and license certificates).
// Text you build in the browser (a license certificate, a CSV report). `type` is its media type.
export const downloadTextFile = (fileName: string, content: string, type = 'text/plain;charset=utf-8') => downloadFile(fileName, new Blob([content], { type }));

// "Ramadan Kareem Intro" -> "ramadan-kareem-intro". Keeps Arabic letters.
export const toFileName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'download';
