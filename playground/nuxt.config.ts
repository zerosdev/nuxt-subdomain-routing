export default defineNuxtConfig({
  modules: ['../src/module'],
  subdomainRouting: {
    rootDomain: 'yourdomain.com',
    allowedSubdomains: ['landing', 'app']
  }
})
