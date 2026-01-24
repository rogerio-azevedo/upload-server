import { GetObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from './client'

export async function getFileFromStorage(key: string) {
    const command = new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET,
        Key: key,
    })

    const response = await r2.send(command)

    if (!response.Body) {
        throw new Error('File not found')
    }

    return {
        body: response.Body,
        contentType: response.ContentType || 'application/octet-stream',
        contentLength: response.ContentLength,
    }
}
