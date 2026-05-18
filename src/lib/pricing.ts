import { useSettings, parseCustomModels } from "@/lib/settings";

export type DeviceModel = { id: string; name: string; price: number; category: "iphone" | "ipad" };

// Returns built-in MODELS plus any custom models configured in the admin dashboard.
export function useMergedModels(): DeviceModel[] {
  const { settings } = useSettings();
  const custom = parseCustomModels(settings.custom_models_json);
  if (custom.length === 0) return MODELS;
  // De-dupe by id — custom overrides built-in
  const map = new Map<string, DeviceModel>();
  for (const m of MODELS) map.set(m.id, m);
  for (const m of custom) map.set(m.id, m);
  return Array.from(map.values());
}

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
  { id: "ipad8", name: "iPad (8th generation) GSM/WIFI", price: 32, category: "ipad" },
  { id: "ipadair3", name: "iPad Air (3rd generation) GSM/WIFI", price: 35, category: "ipad" },
  { id: "ipadmini5", name: "iPad mini 5 GSM/WIFI", price: 37, category: "ipad" },
  { id: "ipadpro11", name: "iPad Pro 11-inch GSM/WIFI", price: 37, category: "ipad" },
  { id: "ipadpro11-3rd", name: "iPad Pro 11-inch (3rd generation) - GSM", price: 45, category: "ipad" },
  { id: "ipadpro12-3rd-1tb", name: "iPad Pro 12-inch (3rd generation) 1TB", price: 45, category: "ipad" },
  { id: "ipadpro11-2nd", name: "iPad Pro 11-inch (2nd generation) - 1SM", price: 45, category: "ipad" },
  { id: "ipadpro12-4th", name: "iPad Pro 12-inch (4th generation) - GSM", price: 45, category: "ipad" },
  { id: "ipad9", name: "iPad (9th generation) - GSM/WIFI", price: 45, category: "ipad" },
  { id: "ipadair4", name: "iPad Air (4th generation) - GSM/WIFI", price: 45, category: "ipad" },
  { id: "ipad10", name: "iPad (10th generation) - GSM/WIFI", price: 45, category: "ipad" },
  { id: "ipad10-v2", name: "iPad (10th generation) - GSM/WIFI (Cellular)", price: 53, category: "ipad" },
  { id: "ipadmini6", name: "iPad Mini 6 A15 - GSM/WIFI", price: 52, category: "ipad" },
  { id: "ipadpro11-3rd-m1", name: "iPad Pro 11-inch (3rd generation) M1", price: 52, category: "ipad" },
  { id: "ipadpro129-5th-m1", name: "iPad Pro 12.9-inch (5th generation) M1", price: 52, category: "ipad" },
  { id: "ipadpro5-m1", name: "iPad Pro 5th M1", price: 53, category: "ipad" },
  { id: "ipadair5-m1", name: "iPad Air 5th M1 - GSM/WIFI", price: 53, category: "ipad" },
  { id: "ipadpro11-4th-m2", name: "iPad Pro 11-inch (4th generation) M2", price: 53, category: "ipad" },
  { id: "ipadpro129-6th-m2", name: "iPad Pro 12.9-inch (6th generation) M2", price: 52, category: "ipad" },
  { id: "ipadpro11-m2", name: "iPad Pro 11-inch M2 - GSM/WIFI", price: 52, category: "ipad" },
  { id: "ipadair13-m2", name: "iPad Air 13-inch M2 - GSM/WIFI", price: 53, category: "ipad" },
  { id: "ipadair11-m3", name: "iPad Air 11\" inch M3 - GSM/WIFI", price: 63, category: "ipad" },
  { id: "ipadair13-m3", name: "iPad Air 13\" inch M3 - GSM/WIFI", price: 63, category: "ipad" },
  { id: "ipad11-a16", name: "iPad 11th Gen A16 - GSM/WIFI", price: 69, category: "ipad" },
  { id: "ipadmini7-a17", name: "iPad mini 7th Gen (A17 GSM/WIFI)", price: 69, category: "ipad" },
  { id: "ipadpro13-m4", name: "iPad Pro 13-inch M4 - GSM/WIFI", price: 69, category: "ipad" },
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
