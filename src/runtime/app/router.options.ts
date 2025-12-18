import type { RouterOptions } from '@nuxt/schema'

export default <RouterOptions>{
  routes: (routes) => {
    /**
     * Get subdomain value from SSR context or from cookie
     * we set in /server/middleware/subdomain.ts
     */

    const nuxtApp = useNuxtApp()
    const cookie = useCookie<string | null>('subdomain')

    const ssrSubdomain = nuxtApp.ssrContext?.event.context.subdomain
    const subdomain = ssrSubdomain ?? cookie.value

    /**
     * Make sure subdomain cookie always synced with SSR context
     */

    if (ssrSubdomain) cookie.value = ssrSubdomain

    /**
     * If there is no subdomain or this is the root domain (www), nothing to do
     * Just return the original routes
     */

    if (!subdomain || subdomain === 'www') return routes

    /**
     * Filter routes for the current subdomain only
     */

    const subdomainPathPattern = new RegExp(
      `^(/[a-z]{2}|)/${subdomain}(/|$)`,
      'i'
    )

    const matchedRoutes = routes.filter(r =>
      subdomainPathPattern.test(r.path || '')
    )

    /**
     * Remove subdomain prefix from the route paths
     * /en/app/login -> /en/login
     * /app/login -> /login
     */

    const finalRoutes = matchedRoutes.map(route => {
      const subdomainReplacePattern = new RegExp(
        `/${subdomain}(/|$)`, // /app or /app/...
        'i'
      );

      return {
        ...route,
        path: route.path === `/${subdomain}`
          ? '/'
          : route.path
            .replace(subdomainReplacePattern, '/') // replace /en/app/login -> /en/login
            .replace(/\/$/, ''), // remove trailing slash,
      }
    })

    return finalRoutes;
  },

  /**
   * Configure scroll behaviors
   *  */

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition

    if (to.hash) {
      const el = document.querySelector(to.hash) as HTMLElement | null
      return {
        left: 0,
        top: (el?.offsetTop ?? 0) - 30,
        behavior: 'smooth'
      }
    }

    if (to.fullPath === from.fullPath) return
    return { left: 0, top: 0, behavior: 'smooth' }
  }
}
