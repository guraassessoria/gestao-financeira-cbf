import { spawn, spawnSync, SpawnOptions } from 'child_process'
import { existsSync } from 'fs'
import Path from 'path'

interface PythonResult<T> {
  success: boolean
  data?: T
  error?: string
}

interface PythonCommand {
  command: string
  prefixArgs: string[]
}

function canExecute(command: string, prefixArgs: string[] = []): boolean {
  const probe = spawnSync(command, [...prefixArgs, '--version'], {
    stdio: 'ignore',
    shell: false,
  })
  return !probe.error && probe.status === 0
}

function resolvePythonCommand(): PythonCommand | null {
  const custom = process.env.PYTHON_BIN
  if (custom) {
    if (existsSync(custom) || canExecute(custom)) {
      return { command: custom, prefixArgs: [] }
    }
  }

  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || ''
    const winCandidates = [
      Path.join(localAppData, 'Programs', 'Python', 'Python313', 'python.exe'),
      Path.join(localAppData, 'Programs', 'Python', 'Python312', 'python.exe'),
      Path.join(localAppData, 'Programs', 'Python', 'Python311', 'python.exe'),
      Path.join(localAppData, 'Programs', 'Python', 'Python310', 'python.exe'),
      'C:\\Python313\\python.exe',
      'C:\\Python312\\python.exe',
      'C:\\Python311\\python.exe',
      'C:\\Python310\\python.exe',
    ]

    for (const c of winCandidates) {
      if (existsSync(c) && canExecute(c)) {
        return { command: c, prefixArgs: [] }
      }
    }
  }

  if (canExecute('python')) {
    return { command: 'python', prefixArgs: [] }
  }

  if (canExecute('python3')) {
    return { command: 'python3', prefixArgs: [] }
  }

  if (canExecute('py', ['-3'])) {
    return { command: 'py', prefixArgs: ['-3'] }
  }

  return null
}

/**
 * Executa um script Python e retorna o resultado como JSON
 */
export async function runPythonScript<T>(
  scriptPath: string,
  args: string[]
): Promise<PythonResult<T>> {
  const python = resolvePythonCommand()

  if (!python) {
    return {
      success: false,
      error:
        'Python não encontrado. Instale Python 3.x e configure PYTHON_BIN com o caminho do executável (ex.: C:\\Users\\<user>\\AppData\\Local\\Programs\\Python\\Python312\\python.exe). No Windows, desative o alias python.exe da Microsoft Store em Configurações > Aplicativos > Aliases de execução do aplicativo.',
    }
  }

  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''

    const options: SpawnOptions = {
      cwd: Path.dirname(scriptPath),
      stdio: ['ignore', 'pipe', 'pipe'],
    }

    const process = spawn(python.command, [...python.prefixArgs, scriptPath, ...args], options)

    if (process.stdout) {
      process.stdout.on('data', (data: Buffer) => {
        stdout += data.toString()
      })
    }

    if (process.stderr) {
      process.stderr.on('data', (data: Buffer) => {
        stderr += data.toString()
      })
    }

    process.on('close', (code: number | null) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: stderr || `Script falhou com código ${code}`,
        })
        return
      }

      try {
        const data = JSON.parse(stdout) as T
        resolve({
          success: true,
          data,
        })
      } catch (e) {
        resolve({
          success: false,
          error: `Erro ao parsear JSON: ${e instanceof Error ? e.message : 'desconhecido'}`,
        })
      }
    })

    process.on('error', (err: Error) => {
      resolve({
        success: false,
        error: `Erro ao executar script: ${err.message}`,
      })
    })
  })
}

/**
 * Faz parse de arquivo CT2
 */
export async function parseCT2(filePath: string) {
  const scriptPath = Path.join(process.cwd(), 'backend', 'parsers.py')
  return runPythonScript(scriptPath, ['ct2', filePath])
}

/**
 * Faz parse de arquivo CT1
 */
export async function parseCT1(filePath: string) {
  const scriptPath = Path.join(process.cwd(), 'backend', 'parsers.py')
  return runPythonScript(scriptPath, ['ct1', filePath])
}

/**
 * Faz parse de arquivo CTT
 */
export async function parseCTT(filePath: string) {
  const scriptPath = Path.join(process.cwd(), 'backend', 'parsers.py')
  return runPythonScript(scriptPath, ['ctt', filePath])
}

/**
 * Faz parse de arquivo CV0
 */
export async function parseCV0(filePath: string) {
  const scriptPath = Path.join(process.cwd(), 'backend', 'parsers.py')
  return runPythonScript(scriptPath, ['cv0', filePath])
}

/**
 * Faz parse de arquivo de Estrutura DRE
 */
export async function parseEstruturaDRE(filePath: string) {
  const scriptPath = Path.join(process.cwd(), 'backend', 'parsers.py')
  return runPythonScript(scriptPath, ['estrutura_dre', filePath])
}

/**
 * Faz parse de arquivo de De-Para DRE
 */
export async function parseDeParaDRE(filePath: string) {
  const scriptPath = Path.join(process.cwd(), 'backend', 'parsers.py')
  return runPythonScript(scriptPath, ['de_para_dre', filePath])
}
