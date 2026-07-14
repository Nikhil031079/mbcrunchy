export const WEIGHT_UNITS = [
  { value: "gm", label: "Gram", short: "gm" },
  { value: "kg", label: "Kilogram", short: "kg" },
  { value: "ml", label: "Millilitre", short: "ml" },
  { value: "litre", label: "Litre", short: "litre" },
  { value: "pcs", label: "Pieces", short: "pcs" },
  { value: "piece", label: "Piece", short: "piece" },
  { value: "plate", label: "Plate", short: "plate" },
  { value: "pack", label: "Pack", short: "pack" },
  { value: "box", label: "Box", short: "box" },
  { value: "jar", label: "Jar", short: "jar" },
  { value: "bottle", label: "Bottle", short: "bottle" },
] as const;

export type WeightUnit = (typeof WEIGHT_UNITS)[number]["value"];

export function formatWeight(value: number, unit: string): string {
  if (value <= 0) return "";
  switch (unit) {
    case "gm": return value >= 1000 ? `${(value / 1000).toFixed(0)} kg` : `${value} gm`;
    case "ml": return value >= 1000 ? `${(value / 1000).toFixed(1)} litre` : `${value} ml`;
    case "kg": return `${value} kg`;
    case "litre": return `${value} litre`;
    case "pcs": return `${value} pcs`;
    case "piece": return `${value} piece${value !== 1 ? "s" : ""}`;
    case "plate": return `${value} plate${value !== 1 ? "s" : ""}`;
    case "pack": return `${value} pack${value !== 1 ? "s" : ""}`;
    case "box": return `${value} box${value !== 1 ? "es" : ""}`;
    case "jar": return `${value} jar${value !== 1 ? "s" : ""}`;
    case "bottle": return `${value} bottle${value !== 1 ? "s" : ""}`;
    default: return `${value} ${unit}`;
  }
}
