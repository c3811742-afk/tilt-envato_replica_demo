// An image's "look": its 4 x 4 grid of average colors, one hex digit per channel (48 characters).
// Item images were measured the same way when the catalog was built (scripts write mocks/items/itemVisuals.ts):
// center crop to 16:9, scale to 64 x 36, then average each 16 x 9 block.
const grid = { columns: 4, rows: 4, cellWidth: 16, cellHeight: 9 } as const;
const aspect = (grid.columns * grid.cellWidth) / (grid.rows * grid.cellHeight);
const channelSteps = 16;
const channelMax = channelSteps - 1;

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${url}`));
    image.src = url;
  });

// Measures an image file the user picked. Rejects when the file isn't an image the browser can read.
export const measureImageLook = async (file: Blob): Promise<string> => {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const width = grid.columns * grid.cellWidth;
    const height = grid.rows * grid.cellHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available');

    // Center crop to the same 16:9 frame as the item previews.
    const cropWidth = Math.min(image.naturalWidth, image.naturalHeight * aspect);
    const cropHeight = cropWidth / aspect;
    const left = (image.naturalWidth - cropWidth) / 2;
    const top = (image.naturalHeight - cropHeight) / 2;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, left, top, cropWidth, cropHeight, 0, 0, width, height);

    const { data } = context.getImageData(0, 0, width, height);
    let look = '';
    for (let row = 0; row < grid.rows; row++) {
      for (let column = 0; column < grid.columns; column++) {
        const totals = [0, 0, 0];
        for (let y = row * grid.cellHeight; y < (row + 1) * grid.cellHeight; y++) {
          for (let x = column * grid.cellWidth; x < (column + 1) * grid.cellWidth; x++) {
            const offset = (y * width + x) * 4;
            for (let channel = 0; channel < 3; channel++) totals[channel] += data[offset + channel];
          }
        }
        for (const total of totals) {
          const average = total / (grid.cellWidth * grid.cellHeight);
          look += Math.min(channelMax, Math.floor(average / channelSteps)).toString(16);
        }
      }
    }
    return look;
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const isImageLook = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{48}$/.test(value);

// 0 = same colors in the same places, 1 = as different as possible.
export const lookDistance = (a: string, b: string) => {
  let total = 0;
  for (let index = 0; index < a.length; index++) total += Math.abs(parseInt(a[index], 16) - parseInt(b[index], 16));
  return total / (a.length * channelMax);
};
