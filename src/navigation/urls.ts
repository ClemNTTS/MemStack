export function routeHref(path: string, base: string) {
  return base === '/' ? path : `${base}#${path}`
}

export function routeFromLocation(location: { pathname: string, search: string, hash: string }, base: string) {
  return base === '/' ? `${location.pathname}${location.search}` : location.hash.startsWith('#/') ? location.hash.slice(1) : '/'
}

export function assetHref(path: string, base: string) {
  return path.startsWith('/') && !path.startsWith('//') ? `${base}${path.slice(1)}` : path
}
