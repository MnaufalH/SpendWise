import server from "./server/app-server.js"

const host = process.env.HOST
const port = process.env.PORT

server.listen(port, () => {
    console.log(`Server running at http://${host}:${port}`)
})