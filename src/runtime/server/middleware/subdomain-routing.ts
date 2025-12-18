export default defineEventHandler((event) => {
  const config = useRuntimeConfig().public.subdomainRouting

  const host =
    getRequestHeader(event, 'x-forwarded-host') ||
    getRequestHeader(event, 'host') ||
    config.rootDomain

  const cleanHost = host.split(':')[0]

  const parts = cleanHost.split('.')

  // handle localhost / ip
  const subdomain =
    parts.length > 2
      ? parts[0]
      : 'www'

  const allowed = config.allowedSubdomains || []

  event.context.subdomain = allowed.includes(subdomain)
    ? subdomain
    : 'www'

  setCookie(event, 'subdomain', event.context.subdomain, {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })
})
