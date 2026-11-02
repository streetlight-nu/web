/**
 * The lantern from the logo, with its light drawn in three hard steps (`gold`, `light-mid`, `light-high`)
 * and the post in ink. Shown above the heading of a form's thanks state.
 */
export default function Lykta() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true" className="mb-1.5 size-16">
      <path d="M46 20H60L76 76H32Z" className="fill-gold" />
      <path d="M46 20H60L70.67 57.33H36.67Z" className="fill-light-mid" />
      <path d="M46 20H60L65.33 38.67H41.33Z" className="fill-light-high" />
      <path d="M20 76V30a14 14 0 0 1 14-14H60" fill="none" strokeWidth="8" className="stroke-ink" />
    </svg>
  );
}
