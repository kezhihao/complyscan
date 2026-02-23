/**
 * GitHub utility functions
 * Compatible with Cloudflare Workers (Web Crypto API)
 */

/**
 * Verify GitHub webhook signature using Web Crypto API
 */
export async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    // Import secret key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign the payload
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(payload)
    );

    // Convert to hex string
    const expectedSignature = 'sha256=' +
      Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    // Constant-time comparison
    return timingSafeEqual(signature, expectedSignature);
  } catch {
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Fetch repository file tree
 */
export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string,
  token?: string
): Promise<any[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'User-Agent': 'ComplyScan',
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const data = await response.json() as { tree?: any[] };
  return data.tree || [];
}

/**
 * Fetch file content
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'User-Agent': 'ComplyScan',
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const data = await response.json() as { content: string };

  // Decode base64 content using Web API
  const binaryString = atob(data.content);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Post comment on pull request
 */
export async function postPRComment(
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
  token: string
): Promise<void> {
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'ComplyScan',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ body }),
    }
  );
}
