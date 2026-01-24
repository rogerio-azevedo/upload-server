import { getFileFromStorage } from '@/infra/storage/get-file-from-storage'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const downloadFileRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/download',
    {
      schema: {
        summary: 'Download a file from storage',
        tags: ['downloads'],
        querystring: z.object({
          url: z.string().url(),
        }),
      },
    },
    async (request, reply) => {
      const { url } = request.query

      try {
        // Extrai a key da URL do R2
        const urlObj = new URL(url)
        const key = urlObj.pathname.substring(1) // Remove a barra inicial

        const file = await getFileFromStorage(key)

        // Converte o stream para buffer
        const chunks: Uint8Array[] = []
        for await (const chunk of file.body as any) {
          chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)

        // Extrai o nome do arquivo da key
        const filename = key.split('/').pop() || 'download'

        reply
          .header('Content-Type', file.contentType)
          .header('Content-Disposition', `attachment; filename="${filename}"`)
          .header('Content-Length', file.contentLength)
          .send(buffer)
      } catch (error) {
        console.error('Error downloading file:', error)
        return reply.status(404).send({ message: 'File not found' })
      }
    }
  )
}
