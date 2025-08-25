import { randomUUID } from 'node:crypto'
import { isRight, unwrapEither } from '@/shared/either'
import { makeUpload } from '@/test/factories/make-uploads'
import dayjs from 'dayjs'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { exportUploads } from './export-uploads'
import * as upload from '@/infra/storage/upload-file-to-storage'

describe('export Uploads', () => {
  const uploadsStub = vi.spyOn(upload, 'uploadFileToStorage').mockImplementationOnce(async () => {
    return {
      key: `${randomUUID()}.csv`,
      url: `https://example.com/file.csv`,
    }
  })

  it('should be able to export uploads', async () => {
    const namePattern = randomUUID()

    const upload1 = await makeUpload({ name: `${namePattern}.webp` })
    const upload2 = await makeUpload({ name: `${namePattern}.webp` })
    const upload3 = await makeUpload({ name: `${namePattern}.webp` })
    const upload4 = await makeUpload({ name: `${namePattern}.webp` })
    const upload5 = await makeUpload({ name: `${namePattern}.webp` })

    const sut = await exportUploads({
      searchQuery: namePattern,
    })

    const generatedCSVStream = uploadsStub.mock.calls[0][0].contentStream

    const csvAsString = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = []

      generatedCSVStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      generatedCSVStream.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf-8'))
      })

      generatedCSVStream.on('error', (error) => {
        reject(error)
      })
    })

    const csvAsArray = csvAsString.trim().split('\n').map(line => line.split(','))
    console.log(csvAsArray)


    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).reportUrl).toBe('https://example.com/file.csv')
    expect(csvAsArray).toEqual([
      ['ID', 'Name', 'URL', 'Uploaded at'],
      [upload1.id, upload1.name, upload1.remoteURL, expect.any(String)],
      [upload2.id, upload2.name, upload2.remoteURL, expect.any(String)],
      [upload3.id, upload3.name, upload3.remoteURL, expect.any(String)],
      [upload4.id, upload4.name, upload4.remoteURL, expect.any(String)],
      [upload5.id, upload5.name, upload5.remoteURL, expect.any(String)],
    ])

  })
})
