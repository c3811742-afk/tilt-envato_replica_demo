import type { Item } from '@/shared/types';
import { fonts } from './fonts';
import { graphicTemplates } from './graphicTemplates';
import { graphics } from './graphics';
import { music } from './music';
import { photos } from './photos';
import { presentationTemplates } from './presentationTemplates';
import { soundEffects } from './soundEffects';
import { stockVideo } from './stockVideo';
import { videoTemplates } from './videoTemplates';
import { webTemplates } from './webTemplates';

export const mockItems: Item[] = [
  ...videoTemplates,
  ...stockVideo,
  ...music,
  ...soundEffects,
  ...fonts,
  ...graphics,
  ...graphicTemplates,
  ...photos,
  ...presentationTemplates,
  ...webTemplates,
];
