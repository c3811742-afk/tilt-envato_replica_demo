export interface StepperStep {
  label: string;
  description?: string; // shown under the label (e.g. what happens at this stage)
  meta?: string; // a short note under that (e.g. when the stage was reached)
}

export interface StepperProps {
  steps?: StepperStep[];
  current?: number; // index of the current step; steps.length marks every step done
  label?: string; // accessible name of the list, e.g. "Application steps"
  activeColor?: string; // done and current steps
  activeTextColor?: string; // the number on a done or current step
  upcomingColor?: string; // the bar of steps not reached yet
}
