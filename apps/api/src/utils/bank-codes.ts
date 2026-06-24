const BANK_CODES: Record<string, string> = {
  AWASH: 'AWINETAA',
  CBE: 'CBETETAA',
  DASHEN: 'DASHETAA',
  ABYSINIA: 'ABYSETAA',
  WEGAGEN: 'WEGAETAA',
  ZEMEN: 'ZEMEETAA',
  BERHAN: 'BERHETAA',
  NIB: 'NIBEETAA',
  COOP: 'COOPETAA',
  HIJRA: 'HIJRETAA',
  SIINQEE: 'SIINETAA',
  ORROMIA: 'OROMETAA',
  TSEHAY: 'TSEHETAA',
  AHADU: 'AHADETAA',
  BIRR: 'CBETETAA',
};

export function bankCodeForBank(bankName: string): string {
  const upper = bankName.toUpperCase().replace(/\s+/g, '');
  for (const [key, code] of Object.entries(BANK_CODES)) {
    if (upper.includes(key)) return code;
  }
  return 'AWINETAA';
}
