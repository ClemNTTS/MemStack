export function routeHref(path: string, base: string, hashRoutes = base !== '/') {
  return hashRoutes ? `${base}#${path}` : path
}

export function routeFromLocation(location: { pathname: string, search: string, hash: string }, base: string, hashRoutes = base !== '/') {
  return hashRoutes ? location.hash.startsWith('#/') ? location.hash.slice(1) : '/' : `${location.pathname}${location.search}`
}

export function assetHref(path: string, base: string) {
  return path.startsWith('/') && !path.startsWith('//') ? `${base}${path.slice(1)}` : path
}
