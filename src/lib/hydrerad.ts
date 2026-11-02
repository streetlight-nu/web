import { useEffect, useState } from "react";

/**
 * False until the island has hydrated, then true. A form keeps its submit button disabled until then,
 * so it never submits natively before its own handler is in place.
 */
export function useHydrerad() {
  const [hydrerad, setHydrerad] = useState(false);
  useEffect(() => setHydrerad(true), []);
  return hydrerad;
}
