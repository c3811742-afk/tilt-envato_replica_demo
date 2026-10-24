export type ProgramKind = 'studentProgram' | 'competition';
export type ProgramStatus = 'upcoming' | 'open' | 'judging' | 'closed';

// A student creator program or a design competition run with a university.
export interface Program {
  id: string;
  kind: ProgramKind;
  name: string;
  university: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // the program ends, or competition entries close
  resultsDate?: string; // competitions only: winners are announced
  prize?: string; // competitions only
  participants: number;
}

export type ProgramInput = Omit<Program, 'id' | 'participants'>;
