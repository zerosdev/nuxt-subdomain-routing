import {
  defineNuxtModule,
  addRouteMiddleware,
  addServerMiddleware,
  createResolver
} from '@nuxt/kit'

export interface SubdomainOptions {
  rootDomain?: string
}

export default defineNuxtModule<SubdomainOptions>({
  meta: {
    name: 'nuxt-subdomain-routing',
    configKey: 'subdomainRouting'
  },

  defaults: {
    rootDomain: 'localhost:3000'
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // expose config ke runtime
    nuxt.options.runtimeConfig.public.subdomainRouting = options

    // app middleware
    addRouteMiddleware({
      name: 'subdomain-routing-guard',
      path: resolver.resolve('runtime/app/middleware/subdomain-routing-guard.global'),
      global: true
    })

    // server middleware
    addServerMiddleware({
      path: '/',
      handler: resolver.resolve('runtime/server/middleware/subdomain-routing')
    })
  }
})
