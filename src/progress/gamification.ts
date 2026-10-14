import type { LearningProgress } from '../types/progress.ts'

const dayMs = 86400000
const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })

export function activityDay(date: Date) {
  const parts = dayFormat.formatToParts(date)
  const value = (type: string) => parts.find(part => part.type === type)!.value
  return `${value('year')}-${value('month')}-${value('day')}`
}

function dayNumber(day: string) { return Date.parse(`${day}T00:00:00Z`) / dayMs }

export function learningRewards(progress: LearningProgress, now = new Date()) {
  const dates = [...Object.values(progress.completedLessons), ...progress.history.map(event => event.reviewedAt)]
    .map(value => new Date(value)).filter(date => Number.isFinite(date.getTime()) && date.getTime() <= now.getTime())
  const days = [...new Set(dates.map(activityDay))].sort()
  let longestStreak = 0
  let run = 0
  let previous = -Infinity
  for (const day of days) {
    const value = dayNumber(day)
    run = value === previous + 1 ? run + 1 : 1
    longestStreak = Math.max(longestStreak, run)
    previous = value
  }
  const today = activityDay(now)
  const currentStreak = previous >= dayNumber(today) - 1 ? run : 0
  const lessons = Object.values(progress.completedLessons).filter(value => Number.isFinite(Date.parse(value)) && Date.parse(value) <= now.getTime()).length
  // One award per card and day, irrespective of repeated clicks or the rating chosen.
  const practices = new Set(progress.history.filter(event => Number.isFinite(Date.parse(event.reviewedAt)) && Date.parse(event.reviewedAt) <= now.getTime())
    .map(event => `${event.cardId}:${activityDay(new Date(event.reviewedAt))}`)).size
  const xp = lessons * 20 + practices * 5
  const level = Math.floor(Math.sqrt(xp / 100)) + 1
  const levelStart = 100 * (level - 1) ** 2
  const nextLevelAt = 100 * level ** 2
  return { xp, level, levelStart, nextLevelAt, currentStreak, longestStreak, activeDays: days.length, activeToday: days.includes(today), practices }
}
