export interface WaveformProps {
  peaks?: number[]; // loudness of each bar, 0-1
  progress?: number; // 0-1: bars before this point are drawn as played
  onSeek?: (fraction: number) => void; // a click or arrow key moves the position (0-1)
  label?: string; // accessible name of the position slider
  valueText?: string; // what screen readers announce, e.g. "1:05 of 2:30"
  height?: string;
  color?: string; // bars not played yet (drawn faint)
  playedColor?: string;
  keyStep?: number; // how far (0-1) an arrow key moves
}
