'use client'

import { useState } from 'react'
import { markNotificationRead, markAllNotificationsRead } from '@/lib/actions/notification.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  createdAt: Date
}

export function NotificationList({ initialNotifications, userId }: { initialNotifications: Notification[]; userId: string }) {
  const t = useTranslations('merchant.dashboard')
  const tCommon = useTranslations('common')
  const [notifications, setNotifications] = useState(initialNotifications)

  async function handleRead(id: string) {
    await markNotificationRead(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  async function handleReadAll() {
    await markAllNotificationsRead(userId)
    setNotifications([])
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-zinc-400 text-sm">
          {t('noNotifications')}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t('notifications')}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{notifications.length}</Badge>
            <Button size="sm" variant="ghost" className="text-xs text-zinc-400" onClick={handleReadAll}>
              {tCommon('markAllRead')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-start justify-between gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
            <div>
              <p className="text-sm font-medium text-zinc-900">{n.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{n.message}</p>
              <p className="text-xs text-zinc-400 mt-1">
                {new Date(n.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button size="sm" variant="ghost" className="text-xs shrink-0" onClick={() => handleRead(n.id)}>
              {tCommon('markRead')}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
