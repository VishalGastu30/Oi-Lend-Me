/**
 * Manual mock for jose ESM module
 * Provides SignJWT and jwtVerify stubs for Jest tests
 */

export class SignJWT {
  private payload: any;
  private header: any = { alg: 'HS256' };

  constructor(payload: any) {
    this.payload = payload;
  }

  setProtectedHeader(header: any) {
    this.header = header;
    return this;
  }

  setExpirationTime(_exp: string | number) {
    return this;
  }

  setIssuedAt() {
    return this;
  }

  async sign(_secret: any): Promise<string> {
    // Return a deterministic mock JWT
    const base64Payload = Buffer.from(JSON.stringify(this.payload)).toString('base64url');
    return `mock-header.${base64Payload}.mock-signature`;
  }
}

export async function jwtVerify(token: string, _secret: any) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return { payload };
  } catch {
    throw new Error('JWSSignatureVerificationFailed');
  }
}

export function createRemoteJWKSet() {
  return async () => ({});
}
