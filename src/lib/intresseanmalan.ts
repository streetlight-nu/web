/**
 * Intresseanmälan: the first step towards becoming a fadder. A person registers interest and the
 * association gets in touch.
 *
 * This module is the one place where an intresseanmälan leaves the page. In v1 no form service is
 * connected (the choice of service and recipient is the association's), so `skickaIntresseanmalan`
 * sends nothing and answers "inte-kopplat". To connect a service, change only that function and its
 * answer type `Svar`, and let the form's thanks state say what the new answer means.
 */

/** What the person wants: fadder for all the children, fadder for one child, or to know more first. */
export type Val = "fadder-alla" | "fadder-barn" | "veta-mer";

export const VAL: { value: Val; label: string }[] = [
  { value: "fadder-alla", label: "fadder för alla barnen" },
  { value: "fadder-barn", label: "fadder för ett barn" },
  { value: "veta-mer", label: "veta mer först" },
];

export interface Intresseanmalan {
  namn: string;
  epost: string;
  /** Optional; empty when not given. */
  telefon: string;
  val: Val;
  /** Optional; empty when not given. */
  meddelande: string;
}

export type Fel = Partial<Record<"namn" | "epost", string>>;

const EPOST = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checks the required fields. Returns one message per wrong field, saying what is wrong and how to fix it. */
export function valideraIntresseanmalan(anmalan: Pick<Intresseanmalan, "namn" | "epost">): Fel {
  const fel: Fel = {};
  if (!anmalan.namn.trim()) fel.namn = "Skriv ditt namn så vet vi vem vi ska kontakta.";
  if (!EPOST.test(anmalan.epost.trim())) fel.epost = "Kontrollera e-postadressen, till exempel namn@exempel.se.";
  return fel;
}

/** The answer from sending. In v1 it is always "inte-kopplat"; a connected service adds its own answers here. */
export type Svar = { status: "inte-kopplat" };

/**
 * Sends an intresseanmälan. In v1 nothing is connected: the intresseanmälan never leaves the page,
 * and the answer is always "inte-kopplat".
 */
export async function skickaIntresseanmalan(_anmalan: Intresseanmalan): Promise<Svar> {
  return { status: "inte-kopplat" };
}
