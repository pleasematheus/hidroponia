import * as net from "net"

/**
 * Calcula a média de um array de números.
 */
function calcularMedia(valores: number[]): number {
  if (valores.length === 0) return 0
  const soma = valores.reduce((acum, val) => acum + val, 0)
  return parseFloat((soma / valores.length).toFixed(2))
}

/**
 * Calcula a mediana de um array de números.
 */
function calcularMediana(valores: number[]): number {
  if (valores.length === 0) return 0
  const ordenados = valores.slice().sort((a, b) => a - b)
  const meio = Math.floor(ordenados.length / 2)
  if (ordenados.length % 2 !== 0) {
    return ordenados[meio]
  } else {
    return parseFloat(((ordenados[meio - 1] + ordenados[meio]) / 2).toFixed(2))
  }
}

/**
 * Mapeia as bancadas e armazena os dados recebidos em memória.
 * Cada bancada terá arrays de números para cada parâmetro.
 */
const dadosBancadas: {
  [id: string]: {
    condutividade: number[]
    umidade: number[]
    temperatura: number[]
  }
} = {}

// Configuramos as portas que podem ter bancadas (de 5001 a 5005)
const portasBancadas = [5001, 5002, 5003, 5004, 5005]
portasBancadas.forEach((porta, indice) => {
  const id = `Bancada ${indice + 1}`
  dadosBancadas[id] = {
    condutividade: [],
    umidade: [],
    temperatura: [],
  }
})

/**
 * Conecta-se às bancadas para coletar os dados.
 */
async function interrogarBancadas() {
  for (let i = 0; i < portasBancadas.length; i++) {
    const porta = portasBancadas[i]
    const id = `Bancada ${i + 1}`
    const leitura = await coletarDadosBancada(porta, id)
    if (leitura) {
      dadosBancadas[id].condutividade.push(leitura.condutividade)
      dadosBancadas[id].umidade.push(leitura.umidade)
      dadosBancadas[id].temperatura.push(leitura.temperatura)
      console.log(
        `Dados da ${id}: ${leitura.condutividade}, ${leitura.umidade}, ${leitura.temperatura}`
      )
    }
  }
}

/**
 * Conecta com uma bancada e coleta os dados no formato "condutividade,umidade,temperatura".
 */
function coletarDadosBancada(
  porta: number,
  identificador: string
): Promise<{
  condutividade: number
  umidade: number
  temperatura: number
} | null> {
  return new Promise((resolve) => {
    const cliente = net.connect({ port: porta, host: "localhost" }, () => {
      console.log(`Conectado à ${identificador} na porta ${porta}`)
    })
    let dadosRecebidos = ""
    cliente.on("data", (dados: Buffer) => {
      dadosRecebidos += dados.toString()
    })
    cliente.on("end", () => {
      try {
        const partes = dadosRecebidos.split(",")
        if (partes.length < 3) throw new Error("Formato inválido")
        const resultado = {
          condutividade: parseFloat(partes[0]),
          umidade: parseFloat(partes[1]),
          temperatura: parseFloat(partes[2]),
        }
        resolve(resultado)
      } catch (erro) {
        console.error(`Erro ao processar dados da ${identificador}:`, erro)
        resolve(null)
      }
    })
    cliente.on("error", (erro) => {
      console.error(
        `Erro ao conectar com ${identificador} na porta ${porta}: ${erro.message}`
      )
      resolve(null)
    })
  })
}

// Interroga as bancadas a cada 5 segundos para atualizar os dados em memória
setInterval(interrogarBancadas, 5000)

// Cria o servidor da interface para atender os clientes que desejam os dados agregados
const portaInterface = 9000
const servidorInterface = net.createServer((socket) => {
  console.log("Cliente conectado para obter dados agregados.")

  const dadosAgregados: { [id: string]: any } = {}
  Object.keys(dadosBancadas).forEach((id) => {
    const cond = dadosBancadas[id].condutividade
    const umid = dadosBancadas[id].umidade
    const temp = dadosBancadas[id].temperatura

    dadosAgregados[id] = {
      Condutividade: {
        Média: calcularMedia(cond),
        Mediana: calcularMediana(cond),
      },
      Umidade: {
        Média: calcularMedia(umid),
        Mediana: calcularMediana(umid),
      },
      Temperatura: {
        Média: calcularMedia(temp),
        Mediana: calcularMediana(temp),
      },
    }
  })

  // Envia os dados agregados em formato JSON
  socket.write(JSON.stringify(dadosAgregados))
  socket.end()
})

servidorInterface.listen(portaInterface, () => {
  console.log(`Interface está rodando na porta ${portaInterface}`)
})

servidorInterface.on("error", (erro) => {
  console.error("Erro no servidor da interface:", erro)
})