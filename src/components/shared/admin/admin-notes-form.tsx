'use client'

import { useState } from 'react'
import { addAdminNote } from '@/lib/actions/admin.actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  applicationId: string
  initialNote?: string
}

export function AdminNotesForm({ applicationId, initialNote }: Props) {
  const [note, setNote] = useState(initialNote ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError(null)
    const result = await addAdminNote(applicationId, note)
    setSaving(false)
    if (!result.success) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        rows={4}
        placeholder="内部备注（仅 Admin 可见，商户看不到）..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="text-sm"
      />
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {saved && <p className="text-green-600 text-xs">✓ 备注已保存</p>}
      <Button size="sm" variant="outline" onClick={handleSave} disabled={saving} className="self-start">
        {saving ? '保存中...' : '保存备注'}
      </Button>
    </div>
  )
}
