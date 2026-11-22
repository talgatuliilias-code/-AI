export async function hashSecret(secret: string, salt = 'dermasense_kz_v1'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${secret}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
