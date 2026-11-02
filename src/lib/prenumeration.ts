/**
 * Prenumeration: a person asks to get the association's news by e-mail.
 *
 * This module is the one place where a prenumeration leaves the page. In v1 no mailing service is
 * connected (the choice of service and data processor is the association's), so `skickaPrenumeration`
 * sends nothing and answers "inte-kopplat". To connect a service, change only that function and its
 * answer type `Svar`, and let the form's thanks state say what the new answer means.
 */

import { amnesvarden, type Amne } from "./amnen";
import { arEpostadress } from "./falt";

export interface Prenumeration {
  /** Optional; empty when not given. */
  fornamn: string;
  epost: string;
  /** The topics (Ämne) the person wants news about, by value. All are chosen to begin with. */
  amnen: Amne[];
  /** The person's explicit yes to the association keeping the e-mail to send news. Never preselected. */
  samtycke: boolean;
}

export type Fel = Partial<Record<"epost" | "amnen" | "samtycke", string>>;

/**
 * Checks the e-mail, the topics and the consent. Returns one message per wrong field, saying what is wrong
 * and how to fix it. The topics must be at least one, each a value from the ämnes module.
 */
export function valideraPrenumeration(prenumeration: Pick<Prenumeration, "epost" | "amnen" | "samtycke">): Fel {
  const fel: Fel = {};
  if (!prenumeration.epost.trim()) fel.epost = "Skriv din e-postadress.";
  else if (!arEpostadress(prenumeration.epost)) fel.epost = "Kontrollera e-postadressen, till exempel namn@exempel.se.";
  const kanda: readonly string[] = amnesvarden;
  if (prenumeration.amnen.length === 0 || !prenumeration.amnen.every((amne) => kanda.includes(amne))) {
    fel.amnen = "Välj minst en sorts nyheter.";
  }
  if (!prenumeration.samtycke) fel.samtycke = "Kryssa i rutan, annars kan vi inte skicka något till dig.";
  return fel;
}

/** The answer from sending. In v1 it is always "inte-kopplat"; a connected service adds its own answers here. */
export type Svar = { status: "inte-kopplat" };

/**
 * Sends a prenumeration. In v1 nothing is connected: the e-mail never leaves the page, and the answer
 * is always "inte-kopplat".
 */
export async function skickaPrenumeration(_prenumeration: Prenumeration): Promise<Svar> {
  return { status: "inte-kopplat" };
}
