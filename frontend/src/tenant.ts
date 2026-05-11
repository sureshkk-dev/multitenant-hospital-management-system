/** Base domain for tenants, e.g. city.hospital.com → "city" when base is hospital.com */
export function getTenantBaseDomain(): string {
  const raw = (import.meta as any).env?.VITE_TENANT_BASE_DOMAIN as
    | string
    | undefined;
  return (raw ?? 'hospital.com').toLowerCase().trim();
}

/**
 * Tenant slug from the browser hostname, or null on apex / localhost.
 */
export function parseTenantSubdomain(hostname: string): string | null {
  const base = getTenantBaseDomain();
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1') return null;
  if (h === base || h === `www.${base}`) return null;
  const suffix = `.${base}`;
  if (!h.endsWith(suffix)) return null;
  const sub = h.slice(0, -suffix.length);
  if (!sub || sub.includes('.')) return null;
  return sub;
}

export function hostsLineForSubdomain(subdomain: string): string {
  return `127.0.0.1\t${subdomain.toLowerCase()}.${getTenantBaseDomain()}`;
}

export function tenantAppOrigin(subdomain: string): string {
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${protocol}//${subdomain.toLowerCase()}.${getTenantBaseDomain()}${port}`;
}
