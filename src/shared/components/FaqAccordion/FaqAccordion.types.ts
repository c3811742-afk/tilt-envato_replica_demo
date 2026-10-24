export interface FaqEntry {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  entries?: readonly FaqEntry[]; // questions and answers from the text files
}
