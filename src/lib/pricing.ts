export type DeviceModel = { id: string; name: string; price: number; category: "iphone" | "ipad" };

export const MODELS: DeviceModel[] = [
  { id: "xr-xsmax", name: "iPhone Xr / Xs / Xs Max", price: 30, category: "iphone" },
  { id: "11", name: "iPhone 11", price: 37, category: "iphone" },
  { id: "11pro", name: "iPhone 11 Pro", price: 40, category: "iphone" },
  { id: "11promax", name: "iPhone 11 Pro Max", price: 43, category: "iphone" },
  { id: "se2", name: "iPhone SE (2nd Gen)", price: 47, category: "iphone" },
  { id: "12mini", name: "iPhone 12 Mini", price: 50, category: "iphone" },
  { id: "12", name: "iPhone 12", price: 53, category: "iphone" },
  { id: "12pro", name: "iPhone 12 Pro", price: 57, category: "iphone" },
  { id: "12promax", name: "iPhone 12 Pro Max", price: 60, category: "iphone" },
  { id: "se3", name: "iPhone SE (3rd Gen)", price: 58, category: "iphone" },
  { id: "13mini", name: "iPhone 13 Mini", price: 60, category: "iphone" },
  { id: "13", name: "iPhone 13", price: 63, category: "iphone" },
  { id: "13pro", name: "iPhone 13 Pro", price: 67, category: "iphone" },
  { id: "13promax", name: "iPhone 13 Pro Max", price: 70, category: "iphone" },
  { id: "14", name: "iPhone 14", price: 67, category: "iphone" },
  { id: "14plus", name: "iPhone 14 Plus", price: 73, category: "iphone" },
  { id: "14pro", name: "iPhone 14 Pro", price: 80, category: "iphone" },
  { id: "14promax", name: "iPhone 14 Pro Max", price: 80, category: "iphone" },
  { id: "15", name: "iPhone 15 / Plus", price: 80, category: "iphone" },
  { id: "16e", name: "iPhone 16e", price: 80, category: "iphone" },
  { id: "16", name: "iPhone 16", price: 80, category: "iphone" },
  { id: "16pro", name: "iPhone 16 Pro", price: 80, category: "iphone" },
  { id: "16promax", name: "iPhone 16 Pro Max", price: 80, category: "iphone" },
  { id: "17", name: "iPhone 17", price: 90, category: "iphone" },
  { id: "air", name: "iPhone Air", price: 90, category: "iphone" },
  { id: "17pro", name: "iPhone 17 Pro", price: 90, category: "iphone" },
  { id: "17promax", name: "iPhone 17 Pro Max", price: 90, category: "iphone" },
  { id: "ipad", name: "iPad (8th gen → iPad M3)", price: 65, category: "ipad" },
];

// Simple heuristic based on Apple serial conventions.
// Modern (2021+) serials are randomized 10-char — cannot detect; user must pick.
const PREFIX_MAP: Record<string, string> = {
  // legacy partial matches — best effort
  DNP: "11", G0M: "11", F17: "11pro", F2L: "11promax",
  C39: "se2", G6T: "12mini", DX3: "12", F4H: "12pro", G0D: "12promax",
};

export function detectModelFromSerial(serial: string): DeviceModel | null {
  const s = serial.trim().toUpperCase();
  if (s.length < 10) return null;
  const prefix = s.slice(0, 3);
  const id = PREFIX_MAP[prefix];
  if (id) return MODELS.find((m) => m.id === id) ?? null;
  return null;
}
