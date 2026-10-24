export interface ThreadMessage {
  id: string;
  heading: string; // who wrote it and when, already in the reader's language: "Reply from Sara, 24 Oct 2026"
  body: string; // user-written: shown in its own direction
  fromTeam?: boolean; // a reply from the TILT team (tinted, and indented when framed)
}

export interface ThreadProps {
  messages?: ThreadMessage[]; // oldest first
  framed?: boolean; // each message in its own card (a full conversation); off for a compact list inside a card
  label?: string; // accessible name of the list
}
