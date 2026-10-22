import { enterpriseTracks } from '../data/enterprise.ts'

export function resolveEnterpriseTrack(explicit: string | null | undefined, saved: string | null | undefined) {
  return enterpriseTracks.find(track => track.id === explicit)
    ?? enterpriseTracks.find(track => track.id === saved)
}
