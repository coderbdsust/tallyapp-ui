const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = ALPHABET.length;

export function generateCheckDigit(input: string): string {
  let sum = 0;
  let doubleIt = true;

  for (let i = input.length - 1; i >= 0; i--) {
    const val = ALPHABET.indexOf(input[i].toUpperCase());
    if (val === -1) throw new Error(`Invalid character: ${input[i]}`);
    let toAdd = doubleIt ? val * 2 : val;
    if (doubleIt && toAdd >= BASE) toAdd -= BASE - 1;
    sum += toAdd;
    doubleIt = !doubleIt;
  }

  const checkVal = (BASE - (sum % BASE)) % BASE;
  return ALPHABET[checkVal];
}

export function generateRandomLuhnCode(length: number = 6): string {
  if (length < 2) throw new Error("Length must be at least 2 (1+ check digit)");

  const bodyLength = length - 1;
  let body = '';
  for (let i = 0; i < bodyLength; i++) {
    body += ALPHABET[Math.floor(Math.random() * BASE)];
  }

  const checkDigit = generateCheckDigit(body);
  return body + checkDigit;
}
