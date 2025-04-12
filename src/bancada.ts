import * as net from "net"

/**
 * Gera dados aleatórios dos sensores.
 * Retorna um objeto com condutividade, umidade e temperatura.
 */
function gerarDadosSensores(): {
  condutividade: number
  umidade: number
  temperatura: number
} {
  const condutividade = parseFloat((Math.random() * 10 + 1).toFixed(2)) // valor entre 1 e 11
  const umidade = parseFloat((Math.random() * 70 + 30).toFixed(2)) // valor entre 30% e 100%
  const temperatura = parseFloat((Math.random() * 20 + 15).toFixed(2)) // valor entre 15°C e 35°C
  return { condutividade, umidade, temperatura }
}

/**
 * Inicia uma bancada (servidor) na porta definida.
 * @param porta Porta onde o servidor ficará escutando.
 * @param identificador Nome da bancada.
 */
function iniciarBancada(porta: number, identificador: string): void {
  const servidor = net.createServer((socket) => {
    console.log(`Conexão recebida na ${identificador}`)
    const dados = gerarDadosSensores()
    // Envia os dados como string no formato: "condutividade,umidade,temperatura"
    const mensagem = `${dados.condutividade},${dados.umidade},${dados.temperatura}`
    socket.write(mensagem)
    socket.end()
  })

  servidor.listen(porta, () => {
    console.log(`${identificador} está rodando na porta ${porta}`)
  })

  servidor.on("error", (erro) => {
    console.error(`Erro no servidor ${identificador}: ${erro.message}`)
  })
}

// Define um número aleatório de bancadas (entre 2 e 5)
const numeroBancadas = Math.floor(Math.random() * 4) + 2
const portaBase = 5001

console.log(`Inicializando ${numeroBancadas} bancadas...`)
for (let i = 0; i < numeroBancadas; i++) {
  const porta = portaBase + i
  const identificador = `Bancada ${i + 1}`
  iniciarBancada(porta, identificador)
}