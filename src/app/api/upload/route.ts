import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import { v2 as cloudinary } from 'cloudinary'
import { validateUploadFile, IMAGE_UPLOAD_TYPES } from '@/lib/upload/validate'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) ?? 'echobay-crm'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const validationError = validateUploadFile(file)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`
  const resourceType = IMAGE_UPLOAD_TYPES.has(file.type) ? 'image' : 'raw'

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType,
  })

  return NextResponse.json({ publicId: result.public_id, url: result.secure_url })
}
