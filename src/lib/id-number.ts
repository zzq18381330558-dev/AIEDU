function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeIdNumber(value: unknown) {
  const normalized = text(value).toUpperCase();
  return normalized || null;
}

export function isValidIdNumberFormat(value: string) {
  return /^(\d{15}|\d{17}[\dX])$/.test(value);
}

export function normalizeOptionalIdNumber(value: unknown) {
  const normalized = normalizeIdNumber(value);
  if (normalized && !isValidIdNumberFormat(normalized)) {
    throw new Error("身份证号格式不正确");
  }
  return normalized;
}

export function maskIdNumber(idNumber?: string | null) {
  const normalized = normalizeIdNumber(idNumber);
  if (!normalized) return null;
  if (normalized.length <= 8) return `${normalized.slice(0, 2)}****${normalized.slice(-2)}`;
  return `${normalized.slice(0, 4)}**********${normalized.slice(-4)}`;
}
