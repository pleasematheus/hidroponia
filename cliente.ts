import * as net from "net"

interface Bancada {
  id: number
  umidade: number
  temperatura: number
  condutividade: number
}

const cliente: net.Socket = net.createConnection({
  host: "localhost",
  port: 7531,
})

cliente.on("close", () => {
  console.log("Conexão encerrada")
})

cliente.end()