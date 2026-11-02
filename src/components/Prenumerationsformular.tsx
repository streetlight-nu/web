import { useEffect, useRef, useState, type SubmitEvent } from "react";

import FyllsI from "@/components/FyllsI";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
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

const tomPrenumeration: Prenumeration = { fornamn: "", epost: "", samtycke: false };

/**
 * The form "Få nyheterna med e-post" at the end of Nyheter. It validates the e-mail and the consent in place
 * and sends only through skickaPrenumeration(), which in v1 answers "inte kopplat". The thanks state then says
 * plainly that the e-mail was not saved, and "Ändra" brings the form back with the values kept.
 */
export default function Prenumerationsformular({ epost: foreningensEpost }: Props) {
  const [prenumeration, setPrenumeration] = useState<Prenumeration>(tomPrenumeration);
  const [fel, setFel] = useState<Fel>({});
  const [lage, setLage] = useState<"formular" | "tack">("formular");
  const [hydrerad, setHydrerad] = useState(false);
  const fornamnRef = useRef<HTMLInputElement>(null);
  const epostRef = useRef<HTMLInputElement>(null);
  const samtyckeRef = useRef<HTMLInputElement>(null);
  const tackRef = useRef<HTMLDivElement>(null);
  const forstaRendern = useRef(true);

  // Until the island has hydrated, the button stays disabled, so the form never submits natively.
  useEffect(() => setHydrerad(true), []);

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
    // An error disappears as soon as the field is right.
    const kvar = valideraPrenumeration(ny);
    if ((fel.epost && !kvar.epost) || (fel.samtycke && !kvar.samtycke)) {
      setFel({ epost: fel.epost && kvar.epost, samtycke: fel.samtycke && kvar.samtycke });
    }
  }

  async function skicka(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nyaFel = valideraPrenumeration(prenumeration);
    setFel(nyaFel);
    if (nyaFel.epost) return epostRef.current?.focus();
    if (nyaFel.samtycke) return samtyckeRef.current?.focus();
    await skickaPrenumeration(prenumeration);
    setLage("tack");
  }

  const fornamn = prenumeration.fornamn.trim().split(/\s+/)[0];

  return (
    <form
      aria-labelledby="prenumeration-rubrik"
      noValidate
      onSubmit={skicka}
      className="on-light grid gap-6 rounded-lg bg-cotton p-[clamp(24px,3.4vw,44px)] text-ink shadow-panel"
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
        <div className="grid gap-[7px]">
          <label className="flex min-h-11 cursor-pointer items-start gap-3">
            <input
              ref={samtyckeRef}
              type="checkbox"
              name="samtycke"
              required
              aria-invalid={fel.samtycke ? true : undefined}
              aria-describedby={fel.samtycke ? "prenumeration-samtycke-fel" : undefined}
              checked={prenumeration.samtycke}
              onChange={(e) => andra("samtycke", e.target.checked)}
              className="mt-[5px] size-5 shrink-0 cursor-pointer accent-ink"
            />
            <span>Föreningen får spara min e-post för att skicka nyheter. Jag kan avsluta när jag vill.</span>
          </label>
          {fel.samtycke && (
            <span id="prenumeration-samtycke-fel" className="ml-8 text-label font-medium text-error">
              {fel.samtycke}
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
          <svg viewBox="0 0 80 80" aria-hidden="true" className="mb-1.5 size-16">
            <path d="M46 20H60L76 76H32Z" fill="#F4B400" />
            <path d="M46 20H60L70.67 57.33H36.67Z" fill="#FFCF45" />
            <path d="M46 20H60L65.33 38.67H41.33Z" fill="#FFDB73" />
            <path d="M20 76V30a14 14 0 0 1 14-14H60" fill="none" stroke="#0B2E24" strokeWidth="8" />
          </svg>
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
