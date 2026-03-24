'use client'

import { ChangeEvent, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Image as ImageIcon, Plus, Save, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  deleteLandingMediaAsset,
  registerLandingMediaAsset,
  type LandingMediaAsset,
  updateLandingContent,
} from '@/lib/actions/landing-content'
import {
  DEFAULT_LANDING_CONTENT,
  type LandingContent,
  type LandingFeatureItem,
  type LandingFloatingCard,
  type LandingFooterLink,
  type LandingFaqItem,
  type LandingFlowStep,
  type LandingNavigationItem,
  type LandingPricingPlan,
  type LandingProgramItem,
  type LandingShowcaseImage,
  type LandingSocialLink,
  type LandingStatItem,
  type LandingTestimonial,
} from '@/lib/landing-content'
import { createClient } from '@/lib/supabase/client'

type LandingContentAdminClientProps = {
  initialContent: LandingContent
  initialMediaAssets: LandingMediaAsset[]
}

type ArrayFieldMap = {
  navigation_items: LandingNavigationItem
  hero_floating_cards: LandingFloatingCard
  stats_items: LandingStatItem
  why_items: LandingFeatureItem
  program_items: LandingProgramItem
  showcase_images: LandingShowcaseImage
  pricing_plans: LandingPricingPlan
  flow_steps: LandingFlowStep
  testimonials_items: LandingTestimonial
  faq_items: LandingFaqItem
  social_links: LandingSocialLink
  footer_quick_links: LandingFooterLink
  footer_program_links: LandingFooterLink
}

const EMPTY_ITEMS: { [K in keyof ArrayFieldMap]: ArrayFieldMap[K] } = {
  navigation_items: { label: 'Item Baru', target: '#hero', type: 'anchor', is_button: false, variant: 'link', sort_order: 1, is_active: true },
  hero_floating_cards: { title: 'Kartu Baru', subtitle: 'Subjudul', icon: 'sparkles', sort_order: 1, is_active: true },
  stats_items: { value: 1, suffix: '+', label: 'Stat Baru', icon: 'monitor', sort_order: 1, is_active: true },
  why_items: { title: 'Fitur Baru', description: 'Deskripsi fitur', icon: 'sparkles', sort_order: 1, is_active: true },
  program_items: { badge: 'Program', category: 'umum', icon: 'Basic', title: 'Program Baru', short_description: 'Deskripsi program', level: 'Pemula', sessions_label: '4 sesi', price_label: 'Rp 0', image_url: '', image_alt: 'Program', cta_text: 'Daftar', cta_url: '/register', features: [], sort_order: 1, is_active: true },
  showcase_images: { image_url: '', alt_text: 'Galeri', caption: '', category: 'galeri', sort_order: 1, is_active: true },
  pricing_plans: { name: 'Paket Baru', price: 'Rp 0', billing_period: 'Per pertemuan', description: 'Deskripsi paket', badge_text: '', is_featured: false, cta_text: 'Daftar', cta_url: '/register', features: [], sort_order: 1, is_active: true },
  flow_steps: { title: 'Langkah', description: 'Deskripsi langkah', icon: 'sparkles', sort_order: 1, is_active: true },
  testimonials_items: { name: 'Nama', role: 'Role', content: 'Isi testimoni', rating: 5, photo_url: '', photo_alt: 'Testimoni', gradient_from: '#667eea', gradient_to: '#764ba2', sort_order: 1, is_active: true },
  faq_items: { question: 'Pertanyaan', answer: 'Jawaban', sort_order: 1, is_active: true },
  social_links: { platform: 'Instagram', label: 'Instagram', url: '#hero', icon: 'sparkles', sort_order: 1, is_active: true },
  footer_quick_links: { label: 'Link', url: '#hero', sort_order: 1, is_active: true },
  footer_program_links: { label: 'Program', url: '#programs', sort_order: 1, is_active: true },
}

function sortItems<T extends { sort_order: number }>(items: T[]) {
  return [...items].sort((left, right) => left.sort_order - right.sort_order)
}

function splitLines(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card><CardHeader className="border-b border-border/50 pb-4"><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-4 pt-5">{children}</CardContent></Card>
}

export function LandingContentAdminClient({ initialContent, initialMediaAssets }: LandingContentAdminClientProps) {
  const [content, setContent] = useState<LandingContent>(initialContent)
  const [mediaAssets, setMediaAssets] = useState<LandingMediaAsset[]>(initialMediaAssets)
  const [deleteTarget, setDeleteTarget] = useState<LandingMediaAsset | null>(null)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const mediaOptions = useMemo(() => mediaAssets.map((asset) => ({ value: asset.public_url, label: `${asset.file_name} (${asset.category ?? 'landing'})` })), [mediaAssets])

  function setField<K extends keyof LandingContent>(field: K, value: LandingContent[K]) {
    setContent((current) => ({ ...current, [field]: value }))
  }

  function updateArrayItem<K extends keyof ArrayFieldMap, P extends keyof ArrayFieldMap[K]>(field: K, index: number, key: P, value: ArrayFieldMap[K][P]) {
    setContent((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    }))
  }

  function addArrayItem<K extends keyof ArrayFieldMap>(field: K) {
    setContent((current) => ({
      ...current,
      [field]: sortItems([...current[field], { ...EMPTY_ITEMS[field], sort_order: current[field].length + 1 }]),
    }))
  }

  function removeArrayItem<K extends keyof ArrayFieldMap>(field: K, index: number) {
    setContent((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, sort_order: itemIndex + 1 })),
    }))
  }

  async function uploadMedia(file: File, folder: string, category: string) {
    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
    const filePath = `${folder}/${Date.now()}-${safeName}`
    const { error } = await supabase.storage.from('landing-media').upload(filePath, file, { upsert: false, contentType: file.type })
    if (error) throw error
    const { data } = supabase.storage.from('landing-media').getPublicUrl(filePath)
    const registered = await registerLandingMediaAsset({
      file_name: file.name,
      file_path: filePath,
      public_url: data.publicUrl,
      alt_text: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      category,
    })
    if ('error' in registered) throw new Error(registered.error)
    setMediaAssets((current) => [registered.asset, ...current])
    return data.publicUrl
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void, key: string, folder: string, category: string) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB.')
      return
    }

    try {
      setUploadingKey(key)
      const publicUrl = await uploadMedia(file, folder, category)
      onSuccess(publicUrl)
      toast.success('Gambar berhasil diupload.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengupload gambar.')
    } finally {
      setUploadingKey(null)
      event.target.value = ''
    }
  }

  function saveContent() {
    startTransition(async () => {
      const result = await updateLandingContent(content)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Konten landing berhasil diperbarui.')
    })
  }

  const renderImageField = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    uploadKey: string,
    folder: string,
    category: string,
    altValue?: string,
    onAltChange?: (value: string) => void
  ) => (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
      <Field label={label}>
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://..." />
      </Field>
      <div className="flex flex-wrap gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium">
          <Upload className="h-4 w-4" />
          {uploadingKey === uploadKey ? 'Mengupload...' : 'Upload Gambar'}
          <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageUpload(event, onChange, uploadKey, folder, category)} />
        </label>
        <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" value="" onChange={(event) => onChange(event.target.value)}>
          <option value="">Pilih dari media library</option>
          {mediaOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <Button type="button" variant="ghost" onClick={() => onChange('')}>Kosongkan</Button>
      </div>
      {value ? <div className="overflow-hidden rounded-xl border border-border bg-background p-3"><img src={value} alt={altValue || label} className="h-40 w-full rounded-lg object-cover" /></div> : null}
      {onAltChange ? <Field label="Alt Text"><Input value={altValue || ''} onChange={(event) => onAltChange(event.target.value)} /></Field> : null}
    </div>
  )

  return (
    <div className="space-y-6">
      <Section title="Website & Navbar">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nama Situs"><Input value={content.site_name} onChange={(event) => setField('site_name', event.target.value)} /></Field>
          <Field label="Teks Logo"><Input value={content.navbar_logo_text} onChange={(event) => setField('navbar_logo_text', event.target.value)} /></Field>
        </div>
        {renderImageField('Logo Navbar', content.navbar_logo_image_url, (value) => setField('navbar_logo_image_url', value), 'navbar-logo', 'branding', 'branding', content.navbar_logo_image_alt, (value) => setField('navbar_logo_image_alt', value))}
        <div className="space-y-4">
          <div className="flex items-center justify-between"><p className="font-medium">Menu Navigasi</p><Button type="button" variant="outline" onClick={() => addArrayItem('navigation_items')}><Plus className="h-4 w-4" />Tambah Menu</Button></div>
          {content.navigation_items.map((item, index) => <div key={`nav-${index}`} className="grid gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 md:grid-cols-6"><Input value={item.label} onChange={(event) => updateArrayItem('navigation_items', index, 'label', event.target.value)} placeholder="Label" /><Input value={item.target} onChange={(event) => updateArrayItem('navigation_items', index, 'target', event.target.value)} placeholder="Target" /><select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" value={item.type} onChange={(event) => updateArrayItem('navigation_items', index, 'type', event.target.value as LandingNavigationItem['type'])}><option value="anchor">Anchor</option><option value="page">Page</option><option value="url">URL</option></select><select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" value={item.variant} onChange={(event) => updateArrayItem('navigation_items', index, 'variant', event.target.value as LandingNavigationItem['variant'])}><option value="link">Link</option><option value="outline">Outline</option><option value="solid">Solid</option></select><label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm"><input type="checkbox" checked={item.is_button} onChange={(event) => updateArrayItem('navigation_items', index, 'is_button', event.target.checked)} /> Tombol</label><div className="flex items-center gap-2"><Input type="number" value={item.sort_order} onChange={(event) => updateArrayItem('navigation_items', index, 'sort_order', Number(event.target.value) || index + 1)} /><Button type="button" variant="ghost" onClick={() => removeArrayItem('navigation_items', index)}><Trash2 className="h-4 w-4" /></Button></div></div>)}
        </div>
      </Section>

      <Section title="Hero">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Badge Hero"><Input value={content.hero_badge} onChange={(event) => setField('hero_badge', event.target.value)} /></Field>
          <Field label="Icon Badge"><Input value={content.hero_badge_icon} onChange={(event) => setField('hero_badge_icon', event.target.value)} /></Field>
          <Field label="Judul Awal"><Input value={content.hero_title_prefix} onChange={(event) => setField('hero_title_prefix', event.target.value)} /></Field>
          <Field label="Judul Highlight"><Input value={content.hero_title_accent} onChange={(event) => setField('hero_title_accent', event.target.value)} /></Field>
          <Field label="Judul Akhir"><Input value={content.hero_title_suffix} onChange={(event) => setField('hero_title_suffix', event.target.value)} /></Field>
          <Field label="CTA Primer URL"><Input value={content.hero_primary_cta_url} onChange={(event) => setField('hero_primary_cta_url', event.target.value)} /></Field>
          <Field label="CTA Primer Teks"><Input value={content.hero_primary_cta_text} onChange={(event) => setField('hero_primary_cta_text', event.target.value)} /></Field>
          <Field label="CTA Sekunder Teks"><Input value={content.hero_secondary_cta_text} onChange={(event) => setField('hero_secondary_cta_text', event.target.value)} /></Field>
          <Field label="CTA Sekunder URL"><Input value={content.hero_secondary_cta_url} onChange={(event) => setField('hero_secondary_cta_url', event.target.value)} /></Field>
        </div>
        <Field label="Deskripsi Hero"><Textarea rows={4} value={content.hero_description} onChange={(event) => setField('hero_description', event.target.value)} /></Field>
        {renderImageField('Gambar Hero', content.hero_image_url, (value) => setField('hero_image_url', value), 'hero-image', 'landing/hero', 'hero', content.hero_image_alt, (value) => setField('hero_image_alt', value))}
        <div className="space-y-4"><div className="flex items-center justify-between"><p className="font-medium">Floating Cards</p><Button type="button" variant="outline" onClick={() => addArrayItem('hero_floating_cards')}><Plus className="h-4 w-4" />Tambah Card</Button></div>{content.hero_floating_cards.map((item, index) => <div key={`float-${index}`} className="grid gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 md:grid-cols-5"><Input value={item.title} onChange={(event) => updateArrayItem('hero_floating_cards', index, 'title', event.target.value)} placeholder="Judul" /><Input value={item.subtitle} onChange={(event) => updateArrayItem('hero_floating_cards', index, 'subtitle', event.target.value)} placeholder="Subjudul" /><Input value={item.icon} onChange={(event) => updateArrayItem('hero_floating_cards', index, 'icon', event.target.value)} placeholder="Icon" /><label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm"><input type="checkbox" checked={item.is_active} onChange={(event) => updateArrayItem('hero_floating_cards', index, 'is_active', event.target.checked)} /> Aktif</label><div className="flex items-center gap-2"><Input type="number" value={item.sort_order} onChange={(event) => updateArrayItem('hero_floating_cards', index, 'sort_order', Number(event.target.value) || index + 1)} /><Button type="button" variant="ghost" onClick={() => removeArrayItem('hero_floating_cards', index)}><Trash2 className="h-4 w-4" /></Button></div></div>)}</div>
      </Section>

      <Section title="Stats & Kenapa Kami">
        <div className="space-y-4"><div className="flex items-center justify-between"><p className="font-medium">Statistik</p><Button type="button" variant="outline" onClick={() => addArrayItem('stats_items')}><Plus className="h-4 w-4" />Tambah Stat</Button></div>{content.stats_items.map((item, index) => <div key={`stat-${index}`} className="grid gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 md:grid-cols-6"><Input type="number" value={item.value} onChange={(event) => updateArrayItem('stats_items', index, 'value', Number(event.target.value) || 0)} placeholder="Angka" /><Input value={item.suffix} onChange={(event) => updateArrayItem('stats_items', index, 'suffix', event.target.value)} placeholder="Suffix" /><Input value={item.label} onChange={(event) => updateArrayItem('stats_items', index, 'label', event.target.value)} placeholder="Label" /><Input value={item.icon} onChange={(event) => updateArrayItem('stats_items', index, 'icon', event.target.value)} placeholder="Icon" /><label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm"><input type="checkbox" checked={item.is_active} onChange={(event) => updateArrayItem('stats_items', index, 'is_active', event.target.checked)} /> Aktif</label><Button type="button" variant="ghost" onClick={() => removeArrayItem('stats_items', index)}><Trash2 className="h-4 w-4" /></Button></div>)}</div>
        <div className="grid gap-4 md:grid-cols-3"><Field label="Badge Section"><Input value={content.why_badge} onChange={(event) => setField('why_badge', event.target.value)} /></Field><Field label="Judul Section"><Input value={content.why_title} onChange={(event) => setField('why_title', event.target.value)} /></Field><Field label="Deskripsi Section"><Input value={content.why_description} onChange={(event) => setField('why_description', event.target.value)} /></Field></div>
      </Section>
      <Section title="Programs, Showcase, Pricing, Flow, Testimoni, FAQ">
        <div className="space-y-4"><div className="flex items-center justify-between"><p className="font-medium">Programs</p><Button type="button" variant="outline" onClick={() => addArrayItem('program_items')}><Plus className="h-4 w-4" />Tambah Program</Button></div>{content.program_items.map((item, index) => <div key={`program-${index}`} className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4"><div className="grid gap-3 md:grid-cols-3"><Input value={item.badge} onChange={(event) => updateArrayItem('program_items', index, 'badge', event.target.value)} placeholder="Badge" /><Input value={item.category} onChange={(event) => updateArrayItem('program_items', index, 'category', event.target.value)} placeholder="Kategori" /><Input value={item.icon} onChange={(event) => updateArrayItem('program_items', index, 'icon', event.target.value)} placeholder="Icon/label" /><Input value={item.title} onChange={(event) => updateArrayItem('program_items', index, 'title', event.target.value)} placeholder="Judul" /><Input value={item.level} onChange={(event) => updateArrayItem('program_items', index, 'level', event.target.value)} placeholder="Level" /><Input value={item.sessions_label} onChange={(event) => updateArrayItem('program_items', index, 'sessions_label', event.target.value)} placeholder="Label sesi" /><Input value={item.price_label} onChange={(event) => updateArrayItem('program_items', index, 'price_label', event.target.value)} placeholder="Harga" /><Input value={item.cta_text} onChange={(event) => updateArrayItem('program_items', index, 'cta_text', event.target.value)} placeholder="CTA Text" /><Input value={item.cta_url} onChange={(event) => updateArrayItem('program_items', index, 'cta_url', event.target.value)} placeholder="CTA URL" /></div><Field label="Deskripsi Singkat"><Textarea rows={2} value={item.short_description} onChange={(event) => updateArrayItem('program_items', index, 'short_description', event.target.value)} /></Field><Field label="Features (1 baris = 1 item)"><Textarea rows={3} value={item.features.join('\n')} onChange={(event) => updateArrayItem('program_items', index, 'features', splitLines(event.target.value))} /></Field>{renderImageField('Gambar Program', item.image_url, (value) => updateArrayItem('program_items', index, 'image_url', value), `program-${index}`, 'landing/programs', 'program', item.image_alt, (value) => updateArrayItem('program_items', index, 'image_alt', value))}<div className="flex items-center gap-3"><label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm"><input type="checkbox" checked={item.is_active} onChange={(event) => updateArrayItem('program_items', index, 'is_active', event.target.checked)} /> Aktif</label><Input type="number" value={item.sort_order} onChange={(event) => updateArrayItem('program_items', index, 'sort_order', Number(event.target.value) || index + 1)} className="w-28" /><Button type="button" variant="ghost" onClick={() => removeArrayItem('program_items', index)}><Trash2 className="h-4 w-4" />Hapus</Button></div></div>)}</div>
        <div className="grid gap-4 md:grid-cols-3"><Field label="Badge Showcase"><Input value={content.showcase_badge} onChange={(event) => setField('showcase_badge', event.target.value)} /></Field><Field label="Judul Showcase"><Input value={content.showcase_title} onChange={(event) => setField('showcase_title', event.target.value)} /></Field><Field label="CTA Showcase"><Input value={content.showcase_cta_text} onChange={(event) => setField('showcase_cta_text', event.target.value)} /></Field></div>
        <Field label="Deskripsi Showcase"><Textarea rows={3} value={content.showcase_description} onChange={(event) => setField('showcase_description', event.target.value)} /></Field>
        <Field label="Fitur Showcase (1 baris = 1 item)"><Textarea rows={4} value={content.showcase_features.join('\n')} onChange={(event) => setField('showcase_features', splitLines(event.target.value))} /></Field>
        <div className="space-y-4"><div className="flex items-center justify-between"><p className="font-medium">Galeri Showcase</p><Button type="button" variant="outline" onClick={() => addArrayItem('showcase_images')}><Plus className="h-4 w-4" />Tambah Gambar</Button></div>{content.showcase_images.map((item, index) => <div key={`showcase-${index}`} className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4"><div className="grid gap-3 md:grid-cols-3"><Input value={item.caption} onChange={(event) => updateArrayItem('showcase_images', index, 'caption', event.target.value)} placeholder="Caption" /><Input value={item.category} onChange={(event) => updateArrayItem('showcase_images', index, 'category', event.target.value)} placeholder="Kategori" /><Input type="number" value={item.sort_order} onChange={(event) => updateArrayItem('showcase_images', index, 'sort_order', Number(event.target.value) || index + 1)} /></div>{renderImageField('Gambar Showcase', item.image_url, (value) => updateArrayItem('showcase_images', index, 'image_url', value), `showcase-${index}`, 'landing/showcase', 'showcase', item.alt_text, (value) => updateArrayItem('showcase_images', index, 'alt_text', value))}<Button type="button" variant="ghost" onClick={() => removeArrayItem('showcase_images', index)}><Trash2 className="h-4 w-4" />Hapus</Button></div>)}</div>
        <div className="grid gap-4 md:grid-cols-3"><Field label="Badge Pricing"><Input value={content.pricing_badge} onChange={(event) => setField('pricing_badge', event.target.value)} /></Field><Field label="Judul Pricing"><Input value={content.pricing_title} onChange={(event) => setField('pricing_title', event.target.value)} /></Field><Field label="Deskripsi Pricing"><Input value={content.pricing_description} onChange={(event) => setField('pricing_description', event.target.value)} /></Field></div>
        <Field label="Catatan Pricing"><Input value={content.pricing_note} onChange={(event) => setField('pricing_note', event.target.value)} /></Field>
        <div className="space-y-4"><div className="flex items-center justify-between"><p className="font-medium">Pricing Plans</p><Button type="button" variant="outline" onClick={() => addArrayItem('pricing_plans')}><Plus className="h-4 w-4" />Tambah Paket</Button></div>{content.pricing_plans.map((item, index) => <div key={`plan-${index}`} className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4"><div className="grid gap-3 md:grid-cols-3"><Input value={item.name} onChange={(event) => updateArrayItem('pricing_plans', index, 'name', event.target.value)} placeholder="Nama paket" /><Input value={item.price} onChange={(event) => updateArrayItem('pricing_plans', index, 'price', event.target.value)} placeholder="Harga" /><Input value={item.billing_period} onChange={(event) => updateArrayItem('pricing_plans', index, 'billing_period', event.target.value)} placeholder="Periode" /><Input value={item.badge_text} onChange={(event) => updateArrayItem('pricing_plans', index, 'badge_text', event.target.value)} placeholder="Badge" /><Input value={item.cta_text} onChange={(event) => updateArrayItem('pricing_plans', index, 'cta_text', event.target.value)} placeholder="CTA Text" /><Input value={item.cta_url} onChange={(event) => updateArrayItem('pricing_plans', index, 'cta_url', event.target.value)} placeholder="CTA URL" /></div><Field label="Deskripsi Paket"><Textarea rows={2} value={item.description} onChange={(event) => updateArrayItem('pricing_plans', index, 'description', event.target.value)} /></Field><Field label="Fitur Paket (1 baris = 1 item)"><Textarea rows={3} value={item.features.join('\n')} onChange={(event) => updateArrayItem('pricing_plans', index, 'features', splitLines(event.target.value))} /></Field><div className="flex items-center gap-3"><label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm"><input type="checkbox" checked={item.is_featured} onChange={(event) => updateArrayItem('pricing_plans', index, 'is_featured', event.target.checked)} /> Featured</label><label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm"><input type="checkbox" checked={item.is_active} onChange={(event) => updateArrayItem('pricing_plans', index, 'is_active', event.target.checked)} /> Aktif</label><Button type="button" variant="ghost" onClick={() => removeArrayItem('pricing_plans', index)}><Trash2 className="h-4 w-4" />Hapus</Button></div></div>)}</div>
      </Section>

      <Section title="Flow, Testimoni, FAQ, Footer, SEO, dan Media">
        <div className="grid gap-4 md:grid-cols-3"><Field label="Badge Flow"><Input value={content.flow_badge} onChange={(event) => setField('flow_badge', event.target.value)} /></Field><Field label="Judul Flow"><Input value={content.flow_title} onChange={(event) => setField('flow_title', event.target.value)} /></Field><Field label="Deskripsi Flow"><Input value={content.flow_description} onChange={(event) => setField('flow_description', event.target.value)} /></Field></div>
        <div className="space-y-4"><div className="flex items-center justify-between"><p className="font-medium">Flow Steps</p><Button type="button" variant="outline" onClick={() => addArrayItem('flow_steps')}><Plus className="h-4 w-4" />Tambah Step</Button></div>{content.flow_steps.map((item, index) => <div key={`flow-${index}`} className="grid gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 md:grid-cols-5"><Input value={item.title} onChange={(event) => updateArrayItem('flow_steps', index, 'title', event.target.value)} placeholder="Judul" /><Input value={item.description} onChange={(event) => updateArrayItem('flow_steps', index, 'description', event.target.value)} placeholder="Deskripsi" /><Input value={item.icon} onChange={(event) => updateArrayItem('flow_steps', index, 'icon', event.target.value)} placeholder="Icon" /><label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm"><input type="checkbox" checked={item.is_active} onChange={(event) => updateArrayItem('flow_steps', index, 'is_active', event.target.checked)} /> Aktif</label><Button type="button" variant="ghost" onClick={() => removeArrayItem('flow_steps', index)}><Trash2 className="h-4 w-4" /></Button></div>)}</div>
        <div className="grid gap-4 md:grid-cols-3"><Field label="Badge Testimoni"><Input value={content.testimonials_badge} onChange={(event) => setField('testimonials_badge', event.target.value)} /></Field><Field label="Judul Testimoni"><Input value={content.testimonials_title} onChange={(event) => setField('testimonials_title', event.target.value)} /></Field><Field label="Deskripsi Testimoni"><Input value={content.testimonials_description} onChange={(event) => setField('testimonials_description', event.target.value)} /></Field></div>
        <div className="space-y-4"><div className="flex items-center justify-between"><p className="font-medium">Testimoni</p><Button type="button" variant="outline" onClick={() => addArrayItem('testimonials_items')}><Plus className="h-4 w-4" />Tambah Testimoni</Button></div>{content.testimonials_items.map((item, index) => <div key={`testimonial-${index}`} className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4"><div className="grid gap-3 md:grid-cols-3"><Input value={item.name} onChange={(event) => updateArrayItem('testimonials_items', index, 'name', event.target.value)} placeholder="Nama" /><Input value={item.role} onChange={(event) => updateArrayItem('testimonials_items', index, 'role', event.target.value)} placeholder="Role" /><Input type="number" value={item.rating} onChange={(event) => updateArrayItem('testimonials_items', index, 'rating', Number(event.target.value) || 5)} placeholder="Rating" /></div><Field label="Isi Testimoni"><Textarea rows={3} value={item.content} onChange={(event) => updateArrayItem('testimonials_items', index, 'content', event.target.value)} /></Field>{renderImageField('Foto Testimoni', item.photo_url, (value) => updateArrayItem('testimonials_items', index, 'photo_url', value), `testimonial-${index}`, 'landing/testimonials', 'testimonial', item.photo_alt, (value) => updateArrayItem('testimonials_items', index, 'photo_alt', value))}<Button type="button" variant="ghost" onClick={() => removeArrayItem('testimonials_items', index)}><Trash2 className="h-4 w-4" />Hapus</Button></div>)}</div>
        <div className="grid gap-4 md:grid-cols-3"><Field label="Badge FAQ"><Input value={content.faq_badge} onChange={(event) => setField('faq_badge', event.target.value)} /></Field><Field label="Judul FAQ"><Input value={content.faq_title} onChange={(event) => setField('faq_title', event.target.value)} /></Field><Field label="Deskripsi FAQ"><Input value={content.faq_description} onChange={(event) => setField('faq_description', event.target.value)} /></Field></div>
        <div className="space-y-4"><div className="flex items-center justify-between"><p className="font-medium">FAQ</p><Button type="button" variant="outline" onClick={() => addArrayItem('faq_items')}><Plus className="h-4 w-4" />Tambah FAQ</Button></div>{content.faq_items.map((item, index) => <div key={`faq-${index}`} className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4"><Input value={item.question} onChange={(event) => updateArrayItem('faq_items', index, 'question', event.target.value)} placeholder="Pertanyaan" /><Textarea rows={3} value={item.answer} onChange={(event) => updateArrayItem('faq_items', index, 'answer', event.target.value)} placeholder="Jawaban" /><div className="flex items-center gap-3"><label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm"><input type="checkbox" checked={item.is_active} onChange={(event) => updateArrayItem('faq_items', index, 'is_active', event.target.checked)} /> Aktif</label><Button type="button" variant="ghost" onClick={() => removeArrayItem('faq_items', index)}><Trash2 className="h-4 w-4" />Hapus</Button></div></div>)}</div>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Judul CTA"><Input value={content.cta_title} onChange={(event) => setField('cta_title', event.target.value)} /></Field><Field label="Deskripsi CTA"><Input value={content.cta_description} onChange={(event) => setField('cta_description', event.target.value)} /></Field><Field label="CTA Primer"><Input value={content.cta_primary_text} onChange={(event) => setField('cta_primary_text', event.target.value)} /></Field><Field label="CTA Primer URL"><Input value={content.cta_primary_url} onChange={(event) => setField('cta_primary_url', event.target.value)} /></Field><Field label="CTA Sekunder"><Input value={content.cta_secondary_text} onChange={(event) => setField('cta_secondary_text', event.target.value)} /></Field><Field label="CTA Sekunder URL"><Input value={content.cta_secondary_url} onChange={(event) => setField('cta_secondary_url', event.target.value)} /></Field></div>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Deskripsi Footer"><Textarea rows={3} value={content.footer_description} onChange={(event) => setField('footer_description', event.target.value)} /></Field><Field label="Judul Kolom Program Footer"><Input value={content.footer_program_title} onChange={(event) => setField('footer_program_title', event.target.value)} /></Field><Field label="Telepon"><Input value={content.contact_phone} onChange={(event) => setField('contact_phone', event.target.value)} /></Field><Field label="Email"><Input value={content.contact_email} onChange={(event) => setField('contact_email', event.target.value)} /></Field><Field label="Alamat"><Input value={content.contact_address} onChange={(event) => setField('contact_address', event.target.value)} /></Field><Field label="Jam Operasional"><Input value={content.contact_hours} onChange={(event) => setField('contact_hours', event.target.value)} /></Field></div>
        <div className="grid gap-4 md:grid-cols-2"><Field label="SEO Meta Title"><Input value={content.seo_meta_title} onChange={(event) => setField('seo_meta_title', event.target.value)} /></Field><Field label="SEO Meta Description"><Textarea rows={3} value={content.seo_meta_description} onChange={(event) => setField('seo_meta_description', event.target.value)} /></Field><Field label="SEO Keywords"><Input value={content.seo_meta_keywords} onChange={(event) => setField('seo_meta_keywords', event.target.value)} /></Field><Field label="OG Title"><Input value={content.seo_og_title} onChange={(event) => setField('seo_og_title', event.target.value)} /></Field><Field label="OG Description"><Textarea rows={3} value={content.seo_og_description} onChange={(event) => setField('seo_og_description', event.target.value)} /></Field></div>
        {renderImageField('OG Image', content.seo_og_image_url, (value) => setField('seo_og_image_url', value), 'og-image', 'branding', 'seo')}
        {renderImageField('Favicon', content.seo_favicon_url, (value) => setField('seo_favicon_url', value), 'favicon', 'branding', 'favicon')}
        <div className="space-y-4"><div className="flex items-center justify-between"><p className="font-medium">Media Library</p><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium"><Upload className="h-4 w-4" />Upload Media<input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageUpload(event, () => undefined, 'media-library', 'landing/library', 'library')} /></label></div><div className="grid gap-4 md:grid-cols-3">{mediaAssets.map((asset) => <div key={asset.id} className="overflow-hidden rounded-2xl border border-border/60 bg-background"><img src={asset.public_url} alt={asset.alt_text ?? asset.file_name} className="h-40 w-full object-cover" /><div className="space-y-2 p-4"><p className="truncate text-sm font-medium">{asset.file_name}</p><p className="text-xs text-muted-foreground">{asset.category ?? 'landing'}</p><Button type="button" variant="ghost" className="w-full" onClick={() => setDeleteTarget(asset)}><Trash2 className="h-4 w-4" />Hapus Media</Button></div></div>)}</div></div>
      </Section>

      <div className="flex justify-end"><Button type="button" onClick={saveContent} disabled={isPending}><Save className="h-4 w-4" />{isPending ? 'Menyimpan...' : 'Simpan CMS Landing'}</Button></div>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}>
        <DialogContent><DialogHeader><DialogTitle>Hapus Media</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">Media akan dihapus dari storage jika tidak sedang dipakai di landing page.</p><DialogFooter><Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button><Button type="button" variant="destructive" onClick={() => { if (!deleteTarget) return; startTransition(async () => { const result = await deleteLandingMediaAsset(deleteTarget.id); if (result.error) { toast.error(result.error); return; } setMediaAssets((current) => current.filter((asset) => asset.id !== deleteTarget.id)); setDeleteTarget(null); toast.success('Media berhasil dihapus.'); }); }}>Hapus</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  )
}
