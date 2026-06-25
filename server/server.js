// Standalone JSON Server for hosting the book-marketplace mock API (e.g. on Render).
// Run locally:  npm install && npm start   (from inside this /server folder)
import jsonServer from 'json-server'

const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Allow the deployed frontend (and local dev) to call this API.
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

server.use(middlewares)
server.use(router)

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`)
})
