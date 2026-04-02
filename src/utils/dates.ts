import moment from 'moment'

export function toISO(d: Date | moment.Moment): string {
  return moment(d).format('YYYY-MM-DD')
}

export function parseISO(s: string): moment.Moment {
  return moment(s, 'YYYY-MM-DD')
}

export function addDays(d: moment.Moment, n: number): moment.Moment {
  return d.clone().add(n, 'days')
}

export function getMondayOfWeek(d: Date | moment.Moment): moment.Moment {
  return moment(d).clone().startOf('isoWeek')
}

export function weekNumberFor(dateISO: string, startDateISO: string): number {
  const start = parseISO(startDateISO)
  const target = parseISO(dateISO)
  return Math.floor(target.diff(start, 'days') / 7) + 1
}

export function isDeloadWeek(weekNum: number): boolean {
  return weekNum % 4 === 0
}

export function formatDate(d: moment.Moment): string {
  return d.format('MMM D')
}

export function today(): moment.Moment {
  return moment().startOf('day')
}
