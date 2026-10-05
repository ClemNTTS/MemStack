import { assetHref, routeFromLocation, routeHref } from './urls'

const base = import.meta.env.BASE_URL

export const appHref = (path: string) => routeHref(path, base)
export const appAsset = (path: string) => assetHref(path, base)
export const currentRoute = () => routeFromLocation(window.location, base)
export const usesHashRoutes = base !== '/'
