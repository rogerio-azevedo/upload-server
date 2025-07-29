import { randomUUID } from 'node:crypto'
import { basename, extname } from 'node:path'
import { Readable } from 'node:stream'
import { Upload } from '@aws-sdk/lib-storage'
import { z } from 'zod'
import { r2 } from './client'

const uploadFileToStorageInput = z.object({
  folder: z.enum(['images', 'downloads']),
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
})

type UploadFileToStorageInput = z.input<typeof uploadFileToStorageInput>

export async function uploadFileToStorage(input: UploadFileToStorageInput) {
  const { folder, fileName, contentType, contentStream } =
    uploadFileToStorageInput.parse(input)

  const fileExtension = extname(fileName)
  const fileWithoutExtension = basename(fileName)
  const sanitizeFileName = fileWithoutExtension.replace(/[^a-zA-Z0-9]/g, '')
  const sanitizeFileNameWithExtension = sanitizeFileName.concat(fileExtension)

  const uniqueFileName = `${folder}/${randomUUID()}-${sanitizeFileNameWithExtension}`

  const upload = new Upload({
    client: r2,
    params: {
      Key: uniqueFileName,
      Body: contentStream,
      Bucket: process.env.CLOUDFLARE_BUCKET,
      ContentType: contentType,
    },
  })

  await upload.done()

  return {
    key: uniqueFileName,
    url: new URL(uniqueFileName, process.env.CLOUDFLARE_PUBLIC_URL).toString(),
  }
}
