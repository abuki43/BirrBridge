// Chapa uses numeric bank codes from GET /v1/banks
// This is seeded with known codes and updated dynamically at runtime via fetchChapaBanks()
const CHAPA_BANK_CODES: Record<string, number> = {
  AWASH: 152,
  CBE: 128,
  DASHEN: 153,
  ABYSINIA: 154,
  ABYSSINIA: 154,
  WEGAGEN: 472,
  ZEMEN: 155,
  BERHAN: 571,
  NIB: 156,
  COOP: 157,
  HIJRA: 158,
  SIINQEE: 159,
  ORROMIA: 160,
  TSEHAY: 161,
  AHADU: 207,
  BIRR: 128,
  TELEBIRR: 855,
  'ADDIS INTERNATIONAL': 772,
  ENAT: 1,
  'GLOBAL BANK': 301,
  'LION INTERNATIONAL': 315,
  BOA: 154,
  BUNNA: 162,
  KACHA: 125,
  'M-PESA': 266,
  YAYA: 867,
};

export async function getChapaBankCode(
  bankName: string,
  fetchBanks: () => Promise<{ id: number; name: string }[]>,
): Promise<number> {
  const upper = bankName.toUpperCase().replace(/\s+/g, '');

  // Try dynamic fetch first, fall back to static map
  try {
    const banks = await fetchBanks();
    for (const bank of banks) {
      const bankUpper = bank.name.toUpperCase().replace(/\s+/g, '');
      if (bankUpper.includes(upper) || upper.includes(bankUpper)) {
        return bank.id;
      }
    }
  } catch {
    // fall through to static map
  }

  for (const [key, code] of Object.entries(CHAPA_BANK_CODES)) {
    if (upper.includes(key)) return code;
  }

  throw new Error(`Unsupported bank: ${bankName}. Chapa does not support this bank for payouts.`);
}

export function getSupportedBanksStatic(): { name: string; code: number }[] {
  return Object.entries(CHAPA_BANK_CODES).map(([name, code]) => ({ name, code }));
}
