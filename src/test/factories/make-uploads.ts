import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { fakerPT_BR as faker } from '@faker-js/faker'
import type { InferInsertModel } from 'drizzle-orm'

export const makeUpload = async (
  overrides?: Partial<InferInsertModel<typeof schema.uploads>>
) => {
  const fileName = faker.system.fileName()

  const result = await db
    .insert(schema.uploads)
    .values({
      name: fileName,
      remoteKey: `images/${fileName}`,
      remoteURL: `https://example.com/images/${fileName}`,
      createdAt: new Date(),
      ...overrides,
    })
    .returning()

  return result[0]
}
