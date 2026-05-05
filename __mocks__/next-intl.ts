// Jest mock for next-intl
// Returns actual zh.json translation values so existing tests pass

import messages from '../messages/zh.json'

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return path // fallback to key
    }
  }
  return typeof current === 'string' ? current : path
}

function buildT(namespace?: string) {
  return function t(key: string): string {
    const fullKey = namespace ? `${namespace}.${key}` : key
    return getNestedValue(messages as Record<string, unknown>, fullKey)
  }
}

const useTranslations = (namespace?: string) => buildT(namespace)

const useLocale = () => 'zh'

const useFormatter = () => ({
  dateTime: (date: Date) => date.toISOString(),
  number: (n: number) => String(n),
})

const getTranslations = (namespace?: string) => Promise.resolve(buildT(namespace))

module.exports = {
  useTranslations,
  useLocale,
  useFormatter,
  getTranslations,
}
