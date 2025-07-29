import { env } from '@/env'
import { fastifyCors } from '@fastify/cors'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import { transformSwaggerSchema } from './routes/transform-swagger-schema'
import { uploadImageRoute } from './routes/upload-image'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    reply.status(400).send({
      message: 'Validation error',
      issues: error.validation,
    })
  }

  console.error('Error occurred:', error)

  reply.status(500).send({
    message: 'An unexpected error occurred',
  })
})

server.register(fastifyCors, { origin: '*' })
server.register(fastifyMultipart)

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Upload Server API',
      version: '1.0.0',
    },
  },
  transform: transformSwaggerSchema,
})

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

server.register(uploadImageRoute)

server.get('/', () => {
  return 'Hello World'
})

console.log('Starting server...', env.DATABASE_URL)

server
  .listen({ port: 3333, host: '0.0.0.0' })
  .then(() => console.log('Server is running'))
