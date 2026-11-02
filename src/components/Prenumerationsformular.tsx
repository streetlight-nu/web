import { useEffect, useRef, useState, type RefObject, type SubmitEvent } from "react";

import FyllsI from "@/components/FyllsI";
import Lykta from "@/components/Lykta";
import { Button } from "@/components/ui/button";
import { CheckboxChip } from "@/components/ui/checkbox-chip";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AMNEN, amnesvarden, type Amne } from "@/lib/amnen";
import { useHydrerad } from "@/lib/hydrerad";
import {
  skickaPrenumeration,
  valideraPrenumeration,
  type Fel,
  type Prenumeration,
} from "@/lib/prenumeration";

interface Props {
  /** The association's e-mail from the föreningsuppgifter; missing means "fylls i". */
  epost?: string;
}

const tomPrenumeration: Prenumeration = { fornamn: "", epost: "", amnen: [...amnesvarden], medgivande: false };

/**
 * The form "Få nyheterna med e-post" at the end of Nyheter. It validates the e-mail, the topics and the
 * medgivande in place and sends only through skickaPrenumeration(), which in v1 answers "inte kopplat". The thanks state then says
 * plainly that the e-mail was not saved, and "Ändra" brings the form back with the values kept.
 */
export default function Prenumerationsformular({ epost: foreningensEpost }: Props) {
  const [prenumeration, setPrenumeration] = useState<Prenumeration>(tomPrenumeration);
  const [fel, setFel] = useState<Fel>({});
  const [lage, setLage] = useState<"formular" | "tack">("formular");
  const hydrerad = useHydrerad();
  const fornamnRef = useRef<HTMLInputElement>(null);
  const epostRef = useRef<HTMLInputElement>(null);
  const forstaAmnetRef = useRef<HTMLInputElement>(null);
  const medgivandeRef = useRef<HTMLInputElement>(null);
  /** The field to focus for each error. */
  const felfalt: Record<keyof Fel, RefObject<HTMLInputElement | null>> = {
    epost: epostRef,
    amnen: forstaAmnetRef,
    medgivande: medgivandeRef,
  };
  const tackRef = useRef<HTMLDivElement>(null);
  const forstaRendern = useRef(true);

  useEffect(() => {
    if (forstaRendern.current) {
      forstaRendern.current = false;
      return;
    }
    if (lage === "tack") tackRef.current?.focus();
    else fornamnRef.current?.focus();
  }, [lage]);

  function andra<K extends keyof Prenumeration>(falt: K, varde: Prenumeration[K]) {
    const ny = { ...prenumeration, [falt]: varde };
    setPrenumeration(ny);
    // Every error shown is checked again: it disappears as soon as the field is right, and otherwise
    // says what is wrong now (an empty e-mail that gets a letter is no longer empty but unclear).
    const kvar = valideraPrenumeration(ny);
    const visade = (Object.keys(fel) as (keyof Fel)[]).filter((nyckel) => kvar[nyckel]);
    setFel(Object.fromEntries(visade.map((nyckel) => [nyckel, kvar[nyckel]])));
  }

  /** Chooses or drops a topic, keeping the topics in the order of the ämnes module. */
  function valjAmne(varde: Amne, vald: boolean) {
    const valda = new Set(prenumeration.amnen);
    if (vald) valda.add(varde);
    else valda.delete(varde);
    andra(
      "amnen",
      amnesvarden.filter((amne) => valda.has(amne)),
    );
  }

  async function skicka(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nyaFel = valideraPrenumeration(prenumeration);
    setFel(nyaFel);
    // The errors come in the order of the form, so the first one is the first wrong field.
    const forstaFelet = (Object.keys(nyaFel) as (keyof Fel)[])[0];
    if (forstaFelet) return felfalt[forstaFelet].current?.focus();
    await skickaPrenumeration(prenumeration);
    setLage("tack");
  }

  const fornamn = prenumeration.fornamn.trim().split(/\s+/)[0];

  return (
    <form
      aria-labelledby="prenumeration-rubrik"
      noValidate
      onSubmit={skicka}
      className="on-light grid gap-6 rounded-lg bg-cotton p-[clamp(24px,3.4vw,44px)] text-ink"
    >
      <div className="grid gap-6" hidden={lage !== "formular"}>
        <h3 id="prenumeration-rubrik" className="text-title tracking-[-0.015em]">
          Få nyheterna med e-post
        </h3>
        <div className="grid grid-cols-1 gap-4 min-[521px]:grid-cols-2">
          <FormField id="prenumeration-fornamn" label="Förnamn" valfritt>
            {(koppling) => (
              <Input
                {...koppling}
                ref={fornamnRef}
                name="fornamn"
                autoComplete="given-name"
                value={prenumeration.fornamn}
                onChange={(e) => andra("fornamn", e.target.value)}
              />
            )}
          </FormField>
          <FormField id="prenumeration-epost" label="E-post" fel={fel.epost}>
            {(koppling) => (
              <Input
                {...koppling}
                ref={epostRef}
                name="epost"
                type="email"
                autoComplete="email"
                required
                value={prenumeration.epost}
                onChange={(e) => andra("epost", e.target.value)}
              />
            )}
          </FormField>
        </div>
        <fieldset
          className="grid gap-2"
          aria-describedby={fel.amnen ? "prenumeration-amnen-fel" : undefined}
        >
          <legend className="mb-2 text-label font-semibold">Vilka nyheter vill du ha?</legend>
          <div className="flex flex-wrap gap-2.5">
            {AMNEN.map((amne, i) => (
              <CheckboxChip
                key={amne.varde}
                ref={i === 0 ? forstaAmnetRef : undefined}
                id={`prenumeration-amne-${amne.varde}`}
                name="amnen"
                value={amne.varde}
                aria-invalid={fel.amnen ? true : undefined}
                aria-describedby={fel.amnen ? "prenumeration-amnen-fel" : undefined}
                checked={prenumeration.amnen.includes(amne.varde)}
                onChange={(e) => valjAmne(amne.varde, e.target.checked)}
              >
                {amne.namn}
              </CheckboxChip>
            ))}
          </div>
          {fel.amnen && (
            <span id="prenumeration-amnen-fel" className="text-label font-medium text-error">
              {fel.amnen}
            </span>
          )}
        </fieldset>
        <div className="grid gap-[7px]">
          <label className="flex min-h-11 cursor-pointer items-start gap-3">
            <input
              ref={medgivandeRef}
              type="checkbox"
              name="medgivande"
              required
              aria-invalid={fel.medgivande ? true : undefined}
              aria-describedby={fel.medgivande ? "prenumeration-medgivande-fel" : undefined}
              checked={prenumeration.medgivande}
              onChange={(e) => andra("medgivande", e.target.checked)}
              className="mt-[5px] size-5 shrink-0 cursor-pointer accent-ink"
            />
            <span>Föreningen får spara min e-post för att skicka nyheter. Jag kan avsluta när jag vill.</span>
          </label>
          {fel.medgivande && (
            <span id="prenumeration-medgivande-fel" className="ml-8 text-label font-medium text-error">
              {fel.medgivande}
            </span>
          )}
        </div>
        <Button type="submit" variant="ink" className="justify-self-start" disabled={!hydrerad}>
          Prenumerera
        </Button>
        <p className="text-ink-soft">Formuläret är inte kopplat än. Tills dess skickas ingenting härifrån.</p>
      </div>

      {lage === "tack" && (
        <div
          ref={tackRef}
          tabIndex={-1}
          className="grid content-start gap-3 outline-none"
          aria-labelledby="prenumeration-tack-rubrik"
          role="region"
        >
          <Lykta />
          <h3 id="prenumeration-tack-rubrik" className="text-title tracking-[-0.015em]">
            {fornamn ? `Tack, ${fornamn}!` : "Tack!"}
          </h3>
          <p>
            Formuläret är inte kopplat till föreningen än, så din e-post har <strong>inte</strong> sparats. Mejla oss i
            stället på{" "}
            {foreningensEpost ? (
              <a className="font-semibold text-ink underline" href={`mailto:${foreningensEpost}`}>
                {foreningensEpost}
              </a>
            ) : (
              <FyllsI>e-post fylls i</FyllsI>
            )}{" "}
            och be att få nyheterna.
          </p>
          <Button
            type="button"
            variant="line-ink"
            className="mt-2 justify-self-start"
            onClick={() => setLage("formular")}
          >
            Ändra
          </Button>
        </div>
      )}
    </form>
  );
}
