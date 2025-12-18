// middleware/subdomain-routing-guard.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const { ssrContext } = useNuxtApp()
  const config = useRuntimeConfig().public.subdomainRouting
  const subdomain = ssrContext?.event.context.subdomain || 'www'
  const path = to.fullPath
  const headers = useRequestHeaders()
  const host = (headers.host || config.rootDomain)?.replace(new RegExp(`^www.`), '')
  const allowedSubdomains = config.allowedSubdomains || []

  /**
   * Prevent subdomain access from root domain
   * E.g https://yourdomain.com/app will be redirected to https://app.yourdomain.com
   */

  if (subdomain === 'www') {
    for (const sub of allowedSubdomains) {
      const subdomainPathPattern = new RegExp(
        `^(/[a-z]{2}|)/${sub}(/|$)`,
        'i'
      );

      const subdomainReplacePattern = new RegExp(
        `/${sub}(/|$)`,
        'i'
      );

      if (subdomainPathPattern.test(path)) {
        const proto: string = headers['x-forwarded-proto'] || 'http'
        const cleanPath: string = path
          .replace(subdomainReplacePattern, '/')
          .replace(/\/$/, '');
        const redirectUrl: string = `${proto}://${sub}.${host}${cleanPath}`;
        
        return navigateTo(
          redirectUrl,
          { external: true }
        )
      }
    }
  }
})
