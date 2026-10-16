export const DEFAULT_DARK_ACCENT = "graphite";

export const DARK_ACCENT_OPTIONS = [
  {
    value: DEFAULT_DARK_ACCENT,
    label: "Graphite",
    swatch: "var(--pesu-max-dark-accent-graphite)"
  },
  { value: "cherry", label: "Cherry", swatch: "var(--pesu-max-dark-accent-cherry)" },
  { value: "ember", label: "Ember", swatch: "var(--pesu-max-dark-accent-ember)" },
  { value: "sand", label: "Sand", swatch: "var(--pesu-max-dark-accent-sand)" },
  { value: "lime", label: "Lime", swatch: "var(--pesu-max-dark-accent-lime)" },
  { value: "mint", label: "Mint", swatch: "var(--pesu-max-dark-accent-mint)" },
  { value: "teal", label: "Teal", swatch: "var(--pesu-max-dark-accent-teal)" },
  { value: "sky", label: "Sky", swatch: "var(--pesu-max-dark-accent-sky)" },
  { value: "frost", label: "Frost", swatch: "var(--pesu-max-dark-accent-frost)" },
  { value: "violet", label: "Violet", swatch: "var(--pesu-max-dark-accent-violet)" },
  { value: "orchid", label: "Orchid", swatch: "var(--pesu-max-dark-accent-orchid)" },
  { value: "rose", label: "Rose", swatch: "var(--pesu-max-dark-accent-rose)" }
];

export const darkAccentValue = (value) =>
  DARK_ACCENT_OPTIONS.some((option) => option.value === value) ? value : DEFAULT_DARK_ACCENT;
