import type { Program, ProgramInput } from '@/features/admin/types';
import { authorize, db, findById, logAction, newId, respond } from './mockServer';

// Latest start date first.
export const fetchPrograms = () => respond(() => [...db.programs].sort((a, b) => b.startDate.localeCompare(a.startDate)));

// Adds a program or competition, or updates it when an id is given. Only competitions keep a prize and results date.
export const saveProgram = (actorId: string, input: ProgramInput, id?: string) =>
  respond((): Program => {
    const actor = authorize(actorId, 'managePrograms');
    const isCompetition = input.kind === 'competition';
    const values = {
      ...input,
      name: input.name.trim(),
      university: input.university.trim(),
      description: input.description.trim(),
      prize: isCompetition ? input.prize?.trim() || undefined : undefined,
      resultsDate: isCompetition ? input.resultsDate || undefined : undefined,
    };
    const program = id ? Object.assign(findById(db.programs, id), values) : { id: newId(), participants: 0, ...values };
    if (!id) db.programs.push(program);
    logAction(actor, 'programSaved', { kind: 'program', id: program.id, label: program.name }, {
      change: id ? 'details' : 'added',
    });
    return program;
  });
