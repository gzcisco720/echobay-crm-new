'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

export interface SerializableDoc {
  _id: string
  type: string
  fileName: string
  cloudinaryPublicId?: string
  url?: string
  requestedBy?: string | null
  uploadedAt: string
}

interface DocumentListItemProps {
  doc: SerializableDoc
  onCancel?: (requestId: string) => void
}

export function DocumentListItem({ doc, onCancel }: DocumentListItemProps): React.JSX.Element {
  const t = useTranslations('merchant.documents')
  const isPending = !doc.cloudinaryPublicId

  return (
    <div className="flex items-center justify-between text-sm p-3 bg-white rounded-lg border border-zinc-100">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-medium truncate">{isPending ? doc.type : doc.fileName}</span>
        <span className="text-zinc-400 text-xs">{doc.type}</span>
        {!isPending && (
          <span className="text-zinc-300 text-xs">
            {new Date(doc.uploadedAt).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {isPending ? (
          <>
            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
              {t('waitingUpload')}
            </span>
            {onCancel != null && (
              <button
                onClick={() => onCancel(doc._id)}
                className="text-zinc-400 hover:text-red-500 transition-colors text-xs"
                aria-label={t('cancelRequest')}
              >
                ✕
              </button>
            )}
          </>
        ) : (
          <>
            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
              {doc.requestedBy != null ? t('adminRequest') : t('selfUploaded')}
            </span>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0BB5C4] hover:underline text-xs"
            >
              {t('viewFile')}
            </a>
          </>
        )}
      </div>
    </div>
  )
}
