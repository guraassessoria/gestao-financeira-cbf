import { spawn, SpawnOptions } from 'child_process'
import Path from 'path'

interface PythonResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Executa um script Python e retorna o resultado como JSON
 */
export async function runPythonScript<T>(
  scriptPath: string,
  args: string[]
): Promise<PythonResult<T>> {
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''

    const options: SpawnOptions = {
      cwd: Path.dirname(scriptPath),
      stdio: ['ignore', 'pipe', 'pipe'],
    }

    const process = spawn('python', [scriptPath, ...args], options)

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
