import * as React from "react";

import { Label } from "@/components/ui/label";

/** What FormField hands its field so the label, the error and the field belong together. */
interface FaltKoppling {
  id: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
}

interface FormFieldProps {
  id: string;
  label: string;
  /** Marks the field as optional with "(valfritt)" in the label. */
  valfritt?: boolean;
  /** The error to show below the field; when set, the field is marked invalid and described by it. */
  fel?: string;
  /** Renders the field, spreading the given props onto it (Input, Textarea …). */
  children: (koppling: FaltKoppling) => React.ReactNode;
}

/**
 * One form field (design system FormField): the label above, with "(valfritt)" when optional, the field,
 * and its error below. The error is tied to the field with `aria-invalid` and `aria-describedby`.
 */
function FormField({ id, label, valfritt, fel, children }: FormFieldProps) {
  const felId = `${id}-fel`;
  return (
    <div className="grid min-w-0 gap-[7px]">
      <Label htmlFor={id}>
        {label}
        {valfritt && <span> (valfritt)</span>}
      </Label>
      {children({
        id,
        "aria-invalid": fel ? true : undefined,
        "aria-describedby": fel ? felId : undefined,
      })}
      {fel && (
        <span id={felId} className="text-label font-medium text-error">
          {fel}
        </span>
      )}
    </div>
  );
}

export { FormField };
