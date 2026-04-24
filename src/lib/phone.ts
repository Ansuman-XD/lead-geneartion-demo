// Normalize phone for tel: and wa.me links
export function digitsOnly(phone: string) {
  return (phone || "").replace(/\D/g, "");
}

export function telHref(phone: string) {
  const d = digitsOnly(phone);
  if (!d) return "#";
  // Preserve leading + if present in original
  const plus = phone?.trim().startsWith("+") ? "+" : "";
  return `tel:${plus}${d}`;
}

export function waHref(phone: string) {
  const d = digitsOnly(phone);
  return d ? `https://wa.me/${d}` : "#";
}

export async function callPhone(phone: string) {
  const href = telHref(phone);
  if (href === "#") return false;
  // Use location.href so it works on desktop (Skype/FaceTime/etc.) and mobile
  window.location.href = href;
  return true;
}
