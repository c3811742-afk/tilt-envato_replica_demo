export interface PageBackgroundProps {
  color?: string; // the lines
  highlightColor?: string; // one line in every few
  opacity?: string; // of the lines where they are strongest; they fade out toward the content
  highlightOpacity?: string;
  lineCount?: number;
  highlightEvery?: number; // every nth line uses the highlight color
  strokeWidth?: string;
}
