import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'

const server = fastify()

server.register(fastifyCors, { origin: '*' })

server.get('/', () => {
  return 'Hello World'
})

server.listen({ port: 3333 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server is running on ${address}`)
})
