export const DEFAULT_THEME_VALUE = "default";

// Theme colour palettes
export const THEME_OPTIONS = [
  {
    value: DEFAULT_THEME_VALUE,
    label: "Default",
    background: "#f8f8f8",
    accent: { base: "#055087", bright: "#0091cd", link: "#1155cc", linkHover: "#055087" }
  },
  {
    value: "nord-frost",
    label: "Nord Frost",
    background: "#eceff4",
    accent: { base: "#4c6a8f", bright: "#5e81ac", link: "#4f6d92", linkHover: "#3f587a" }
  },
  {
    value: "nord-ice",
    label: "Nord Ice",
    background: "#eef1f6",
    accent: { base: "#566d87", bright: "#6b8db1", link: "#5b7a99", linkHover: "#4a5f75" }
  },
  {
    value: "nord-cyan",
    label: "Nord Cyan",
    background: "#eef5f7",
    accent: { base: "#4f7d8a", bright: "#6aa3b3", link: "#5a8e9c", linkHover: "#456d78" }
  },
  {
    value: "nord-teal",
    label: "Nord Teal",
    background: "#eff5f5",
    accent: { base: "#527e7d", bright: "#6ba3a2", link: "#5b8f8e", linkHover: "#476d6c" }
  },
  {
    value: "nord-polar",
    label: "Nord Polar",
    background: "#f4f6f8",
    accent: { base: "#3b4252", bright: "#4c566a", link: "#434c5e", linkHover: "#2e3440" }
  },
  {
    value: "nord-red",
    label: "Nord Red",
    background: "#f7f3f4",
    accent: { base: "#8f4a52", bright: "#b0606a", link: "#a04a54", linkHover: "#8f4a52" }
  },
  {
    value: "nord-orange",
    label: "Nord Orange",
    background: "#f9f4f2",
    accent: { base: "#96604d", bright: "#b8795f", link: "#a2674f", linkHover: "#845441" }
  },
  {
    value: "nord-yellow",
    label: "Nord Yellow",
    background: "#faf7ef",
    accent: { base: "#8f7838", bright: "#b39349", link: "#9c7f3d", linkHover: "#7f6a31" }
  },
  {
    value: "nord-green",
    label: "Nord Green",
    background: "#f4f7f0",
    accent: { base: "#5f7847", bright: "#7d9c63", link: "#6b8852", linkHover: "#556b3f" }
  },
  {
    value: "nord-purple",
    label: "Nord Purple",
    background: "#f8f4f8",
    accent: { base: "#7d5f78", bright: "#a07a99", link: "#8f6889", linkHover: "#6f5469" }
  },
  {
    value: "pastel-rose",
    label: "Pastel Rose",
    background: "#faf1f3",
    accent: { base: "#8a5f68", bright: "#a87782", link: "#966672", linkHover: "#7a525b" }
  },
  {
    value: "pastel-lavender",
    label: "Pastel Lavender",
    background: "#f5f3f9",
    accent: { base: "#615680", bright: "#7f74a0", link: "#6f6390", linkHover: "#564c72" }
  },
  {
    value: "pastel-sage",
    label: "Pastel Sage",
    background: "#f3f7f2",
    accent: { base: "#5f7355", bright: "#7d9370", link: "#6d8060", linkHover: "#546548" }
  },
  {
    value: "pastel-sky",
    label: "Pastel Sky",
    background: "#f1f5fa",
    accent: { base: "#4f6680", bright: "#6a819f", link: "#5b728f", linkHover: "#455a72" }
  },
  {
    value: "pastel-sand",
    label: "Pastel Sand",
    background: "#faf6f0",
    accent: { base: "#8a7355", bright: "#a48b6b", link: "#977c5c", linkHover: "#7c664a" }
  },
  {
    value: "pastel-clay",
    label: "Pastel Clay",
    background: "#f8f2f0",
    accent: { base: "#8a6255", bright: "#a57c6d", link: "#966a5a", linkHover: "#7c5849" }
  },
  {
    value: "pastel-mist",
    label: "Pastel Mist",
    background: "#f2f4f6",
    accent: { base: "#5a6672", bright: "#78838f", link: "#68737f", linkHover: "#4d5761" }
  }
];

//Theme Fonts
export const FONT_OPTIONS = [
  { value: DEFAULT_THEME_VALUE, label: "Default", stack: "" },
  {
    value: "berkeley-mono",
    label: "Berkeley Mono",
    stack:
      '"Berkeley Mono", "Berkeley Mono TX-02", ui-monospace, "SF Mono", Menlo, Consolas, monospace'
  },
  {
    value: "system",
    label: "System UI",
    stack: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  {
    value: "helvetica",
    label: "Helvetica",
    stack: 'Helvetica, Arial, "Liberation Sans", sans-serif'
  },
  { value: "verdana", label: "Verdana", stack: 'Verdana, Geneva, "DejaVu Sans", sans-serif' },
  {
    value: "trebuchet",
    label: "Trebuchet",
    stack: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif'
  },
  { value: "tahoma", label: "Tahoma", stack: 'Tahoma, Geneva, Verdana, sans-serif' },
  { value: "georgia", label: "Georgia", stack: 'Georgia, "Times New Roman", serif' },
  { value: "times", label: "Times", stack: '"Times New Roman", Times, "Liberation Serif", serif' },
  {
    value: "palatino",
    label: "Palatino",
    stack: '"Palatino Linotype", "Book Antiqua", Palatino, "URW Palladio L", serif'
  },
  {
    value: "garamond",
    label: "Garamond",
    stack: 'Garamond, "EB Garamond", "Apple Garamond", Georgia, serif'
  }
];
