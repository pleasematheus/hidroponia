import * as net from "net"

interface Produto {
  nome: string
  preco: number
}

const produto: Produto = {
  nome: "Produto 1",
  preco: 10.0,
}

const cliente: net.Socket = net.createConnection({
  host: "172.23.140.187",
  port: 3011,
})

cliente.on("data", (mensagem: Buffer) => {
  console.log(`Mensagem recebida: ${mensagem.toString("utf-8")}`)
})

cliente.on("close", () => {
  console.log("Conexão encerrada")
})

cliente.write(JSON.stringify(produto), () => {
  console.log("Mensagem enviada")
})

cliente.end()
