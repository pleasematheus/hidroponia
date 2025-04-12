import * as net from "net"
import * as readline from "readline"

const portaInterface = 9000
const hostInterface = "localhost"

/**
 * Exibe o menu para o usuário, agora com opção para limpar o terminal.
 */
function mostrarMenu(): void {
  console.log("--- Menu ---")
  console.log("1. Obter dados agregados das bancadas")
  console.log("2. Limpar terminal")
  console.log("3. Sair")

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.question("Escolha uma opção: ", (resposta) => {
    if (resposta === "1") {
      obterDadosAgregados(() => {
        rl.close()
        mostrarMenu()
      })
    } else if (resposta === "2") {
      console.clear()
      rl.close()
      mostrarMenu()
    } else if (resposta === "3") {
      console.log("Encerrando...")
      rl.close()
      process.exit(0)
    } else {
      console.log("Opção inválida.")
      rl.close()
      mostrarMenu()
    }
  })
}

/**
 * Conecta à interface para obter os dados agregados.
 * Os dados são tratados com JSON.parse e exibidos com console.table.
 */
function obterDadosAgregados(callback: () => void): void {
  const cliente = net.connect(
    { port: portaInterface, host: hostInterface },
    () => {
      console.log("Conectado à interface.")
    }
  )

  let dadosRecebidos = ""
  cliente.on("data", (dados: Buffer) => {
    dadosRecebidos += dados.toString()
  })

  cliente.on("end", () => {
    console.log("Dados agregados recebidos:")
    try {
      const dadosAgregados = JSON.parse(dadosRecebidos)
      console.table(dadosAgregados)
    } catch (erro) {
      console.error(
        "Erro ao processar os dados recebidos, exibindo texto bruto:"
      )
      console.log(dadosRecebidos)
    }
    callback()
  })

  cliente.on("error", (erro) => {
    console.error("Erro ao conectar à interface:", erro.message)
    callback()
  })
}

// Limpa o terminal antes de iniciar o cliente
console.clear()
mostrarMenu()