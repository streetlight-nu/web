import { useEffect, useRef, useState, type SubmitEvent } from "react";

import FyllsI from "@/components/FyllsI";
import Lykta from "@/components/Lykta";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ChoiceChip, RadioGroup } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  AVSIKTER,
  skickaIntresseanmalan,
  valideraIntresseanmalan,
  type Fel,
  type Intresseanmalan as Anmalan,
  type Avsikt,
} from "@/lib/intresseanmalan";
import { useHydrerad } from "@/lib/hydrerad";

interface Props {
  /** The association's e-mail from the föreningsuppgifter; missing means "fylls i". */
  epost?: string;
}

const tomAnmalan: Anmalan = { namn: "", epost: "", telefon: "", avsikt: "fadder-alla", meddelande: "" };

/**
 * The intresseanmälan form in "Bli fadder". It validates name and e-mail in place and sends only
 * through skickaIntresseanmalan(), which in v1 answers "inte kopplat". The thanks state then says
 * plainly that nothing was sent, and "Ändra anmälan" brings the form back with the values kept.
 */
export default function Intresseanmalan({ epost }: Props) {
  const [anmalan, setAnmalan] = useState<Anmalan>(tomAnmalan);
  const [fel, setFel] = useState<Fel>({});
  const [lage, setLage] = useState<"formular" | "tack">("formular");
  const hydrerad = useHydrerad();
  const namnRef = useRef<HTMLInputElement>(null);
  const epostRef = useRef<HTMLInputElement>(null);
  const tackRef = useRef<HTMLDivElement>(null);
  const forstaRendern = useRef(true);

  useEffect(() => {
    if (forstaRendern.current) {
      forstaRendern.current = false;
      return;
    }
    if (lage === "tack") tackRef.current?.focus();
    else namnRef.current?.focus();
  }, [lage]);

  function andra<K extends keyof Anmalan>(falt: K, varde: Anmalan[K]) {
    const ny = { ...anmalan, [falt]: varde };
    setAnmalan(ny);
    // An error disappears as soon as the field is right.
    const kvar = valideraIntresseanmalan(ny);
    if ((fel.namn && !kvar.namn) || (fel.epost && !kvar.epost)) {
      setFel({ namn: fel.namn && kvar.namn, epost: fel.epost && kvar.epost });
    }
  }

  async function skicka(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nyaFel = valideraIntresseanmalan(anmalan);
    setFel(nyaFel);
    if (nyaFel.namn) return namnRef.current?.focus();
    if (nyaFel.epost) return epostRef.current?.focus();
    await skickaIntresseanmalan(anmalan);
    setLage("tack");
  }

  const fornamn = anmalan.namn.trim().split(/\s+/)[0];

  return (
    <form
      aria-labelledby="anmal-intresse"
      noValidate
      onSubmit={skicka}
      className="grid gap-5 rounded-lg bg-cotton p-[clamp(24px,3.4vw,44px)] shadow-panel min-[901px]:sticky min-[901px]:top-6"
    >
      <div className="grid gap-5" hidden={lage !== "formular"}>
        <h3 id="anmal-intresse" className="text-title tracking-[-0.015em]">
          Anmäl intresse
        </h3>
        <div className="grid grid-cols-1 gap-4 min-[521px]:grid-cols-2">
          <FormField id="anmalan-namn" label="Namn" fel={fel.namn}>
            {(koppling) => (
              <Input
                {...koppling}
                ref={namnRef}
                name="namn"
                autoComplete="name"
                required
                value={anmalan.namn}
                onChange={(e) => andra("namn", e.target.value)}
              />
            )}
          </FormField>
          <FormField id="anmalan-epost" label="E-post" fel={fel.epost}>
            {(koppling) => (
              <Input
                {...koppling}
                ref={epostRef}
                name="epost"
                type="email"
                autoComplete="email"
                required
                value={anmalan.epost}
                onChange={(e) => andra("epost", e.target.value)}
              />
            )}
          </FormField>
        </div>
        <FormField id="anmalan-telefon" label="Telefon" valfritt>
          {(koppling) => (
            <Input
              {...koppling}
              name="telefon"
              type="tel"
              autoComplete="tel"
              value={anmalan.telefon}
              onChange={(e) => andra("telefon", e.target.value)}
            />
          )}
        </FormField>
        <div className="grid gap-2">
          <span id="anmalan-avsikt" className="text-label font-semibold">
            Jag vill
          </span>
          <RadioGroup
            aria-labelledby="anmalan-avsikt"
            name="avsikt"
            value={anmalan.avsikt}
            onValueChange={(value) => andra("avsikt", value as Avsikt)}
          >
            {AVSIKTER.map((avsikt) => (
              <ChoiceChip key={avsikt.value} id={`anmalan-avsikt-${avsikt.value}`} value={avsikt.value}>
                {avsikt.label}
              </ChoiceChip>
            ))}
          </RadioGroup>
        </div>
        <FormField id="anmalan-meddelande" label="Meddelande" valfritt>
          {(koppling) => (
            <Textarea
              {...koppling}
              name="meddelande"
              value={anmalan.meddelande}
              onChange={(e) => andra("meddelande", e.target.value)}
            />
          )}
        </FormField>
        <Button type="submit" variant="ink" className="justify-self-start" disabled={!hydrerad}>
          Skicka anmälan
        </Button>
        <p className="text-ink-soft">Formuläret är inte kopplat än. Tills dess skickas ingenting härifrån.</p>
      </div>

      {lage === "tack" && (
        <div ref={tackRef} tabIndex={-1} className="grid content-start gap-3 outline-none" aria-labelledby="tack-rubrik" role="region">
          <Lykta />
          <h3 id="tack-rubrik" className="text-title tracking-[-0.015em]">
            Tack, {fornamn}!
          </h3>
          <p>
            Formuläret är inte kopplat till föreningen än, så din anmälan har <strong>inte</strong> skickats. Mejla oss
            i stället på{" "}
            {epost ? (
              <a className="font-semibold text-ink underline" href={`mailto:${epost}`}>
                {epost}
              </a>
            ) : (
              <FyllsI>e-post fylls i</FyllsI>
            )}{" "}
            och berätta att du vill bli fadder.
          </p>
          <Button
            type="button"
            variant="line-ink"
            className="mt-2 justify-self-start"
            onClick={() => setLage("formular")}
          >
            Ändra anmälan
          </Button>
        </div>
      )}
    </form>
  );
}
