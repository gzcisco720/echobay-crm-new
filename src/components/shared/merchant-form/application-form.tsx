'use client'

import { useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { saveDraftApplication } from '@/lib/actions/application.actions'
import { TabCompany } from './tab-company'
import { TabContacts } from './tab-contacts'
import { TabBrandStore } from './tab-brand-store'
import { TabBanking } from './tab-banking'
import { TabPartnership } from './tab-partnership'
import { TabAgreement } from './tab-agreement'

const TABS = [
  { id: 'company', label: '① 公司信息' },
  { id: 'contacts', label: '② 联系人' },
  { id: 'brand', label: '③ 品牌 & 门店' },
  { id: 'banking', label: '④ 银行账户' },
  { id: 'partnership', label: '⑤ 合作方案' },
  { id: 'agreement', label: '⑥ 协议签名' },
] as const

type TabId = (typeof TABS)[number]['id']

interface Props {
  token: string
  invitationId: string
  email: string
}

export function ApplicationForm({ token, invitationId, email }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('company')
  const [completedTabs, setCompletedTabs] = useState<Set<TabId>>(new Set())
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [isSaving, setIsSaving] = useState(false)

  const handleTabData = useCallback(
    async (tabId: TabId, data: Record<string, unknown>, nextTab?: TabId) => {
      const merged = { ...formData, ...data }
      setFormData(merged)
      setCompletedTabs((prev) => new Set([...prev, tabId]))

      setIsSaving(true)
      await saveDraftApplication(token, merged)
      setIsSaving(false)

      if (nextTab) setActiveTab(nextTab)
    },
    [formData, token]
  )

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
      {isSaving && (
        <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100 text-xs text-zinc-400">
          草稿保存中… Draft saving…
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        <div className="overflow-x-auto border-b border-zinc-200">
          <TabsList className="h-auto p-0 bg-transparent rounded-none flex w-max min-w-full">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium text-zinc-500 data-[state=active]:text-zinc-900 gap-1.5"
              >
                {tab.label}
                {completedTabs.has(tab.id) && (
                  <Badge variant="outline" className="text-xs py-0 px-1.5 bg-green-50 text-green-700 border-green-200">
                    ✓
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="company" className="mt-0">
          <TabCompany
            defaultValues={formData}
            onComplete={(data) => handleTabData('company', data, 'contacts')}
          />
        </TabsContent>
        <TabsContent value="contacts" className="mt-0">
          <TabContacts
            defaultValues={formData}
            onComplete={(data) => handleTabData('contacts', data, 'brand')}
            onBack={() => setActiveTab('company')}
          />
        </TabsContent>
        <TabsContent value="brand" className="mt-0">
          <TabBrandStore
            defaultValues={formData}
            onComplete={(data) => handleTabData('brand', data, 'banking')}
            onBack={() => setActiveTab('contacts')}
          />
        </TabsContent>
        <TabsContent value="banking" className="mt-0">
          <TabBanking
            defaultValues={formData}
            onComplete={(data) => handleTabData('banking', data, 'partnership')}
            onBack={() => setActiveTab('brand')}
          />
        </TabsContent>
        <TabsContent value="partnership" className="mt-0">
          <TabPartnership
            defaultValues={formData}
            onComplete={(data) => handleTabData('partnership', data, 'agreement')}
            onBack={() => setActiveTab('banking')}
          />
        </TabsContent>
        <TabsContent value="agreement" className="mt-0">
          <TabAgreement
            email={email}
            token={token}
            allFormData={formData}
            onBack={() => setActiveTab('partnership')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
