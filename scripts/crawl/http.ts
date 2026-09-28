const UA = "KhayiZinCatalog/1.0 (local Myanmar trip planner; public catalog snapshot)";

const BLOCKED = [
  /\/login/i,
  /\/account/i,
  /payment/i,
  /captcha/i,
  /BotDetectCaptcha/i,
  /confirmation/i,
  /email-verify/i,
  /forgot-password/i,
  /\/in-app\//i,
  /\/in-web\//i,
  /wp-admin/i,
  /\/administrator\//i,
];

let chain: Promise<void> = Promise.resolve();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isBlockedUrl(url: string) {
  return BLOCKED.some((pattern) => pattern.test(url));
}

async function politeFetch(url: string): Promise<Response | null> {
  if (isBlockedUrl(url)) {
    console.log(`skip blocked ${url}`);
    return null;
  }
  const run = chain.then(async () => {
    await sleep(1000);
    return fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(40000),
      redirect: "follow",
    });
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  try {
    const res = await run;
    if (!res.ok) {
      console.log(`skip ${res.status} ${url}`);
      return null;
    }
    return res;
  } catch (err) {
    console.log(`skip error ${url} ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

export async function fetchText(url: string): Promise<string | null> {
  const res = await politeFetch(url);
  if (!res) return null;
  return res.text();
}

export async function fetchJson<T>(url: string, init?: { method?: string; body?: string }): Promise<T | null> {
  if (isBlockedUrl(url)) {
    console.log(`skip blocked ${url}`);
    return null;
  }
  const run = chain.then(async () => {
    await sleep(1000);
    return fetch(url, {
      method: init?.method ?? "GET",
      body: init?.body,
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
      signal: AbortSignal.timeout(30000),
    });
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  try {
    const res = await run;
    if (!res.ok) {
      console.log(`skip ${res.status} ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.log(`skip error ${url} ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

export async function collectionAllowed(robotsUrl: string): Promise<boolean> {
  const text = await fetchText(robotsUrl);
  if (!text) return false;
  if (/content-signal:\s*(?:search|ai-input)=no/i.test(text)) return false;
  if (/User-agent:\s*\*[\s\S]*?Disallow:\s*\/\s*$/im.test(text) && !/Allow:\s*\//i.test(text)) {
    return false;
  }
  return true;
}
