import { createContext, useContext } from "react";

/**
 * Lets a `SectionHeader` name its surrounding `Section` landmark.
 *
 * `Section` publishes a generated id and a registration callback; the first
 * `SectionHeader` inside claims the id for its heading and reports back, at
 * which point the section adds `aria-labelledby`. Doing it this way means every
 * section is a properly named landmark without each call site having to invent
 * and thread an id — and a section that contains no header simply never gets a
 * dangling `aria-labelledby` pointing at an element that doesn't exist.
 */
export interface SectionLabelContextValue {
  headingId: string;
  register: () => void;
}

export const SectionLabelContext = createContext<SectionLabelContextValue | null>(null);

export function useSectionLabel(): SectionLabelContextValue | null {
  return useContext(SectionLabelContext);
}
