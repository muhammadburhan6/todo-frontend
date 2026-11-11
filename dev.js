const { spawn } = require('node:child_process')
const http = require('node:http')
const path = require('node:path')

const root = __dirname
const frontend = path.join(root, 'frontend')
const backend = path.join(root, 'backend')
const python = process.platform === 'win32'
  ? path.join(root, '.venv', 'Scripts', 'python.exe')
  : path.join(root, '.venv', 'bin', 'python')
const vite = path.join(frontend, 'node_modules', 'vite', 'bin', 'vite.js')
const children = new Set()
let stopping = false

function stopAll() {
  if (stopping) return
  stopping = true
  for (const child of children) child.kill()
}

function start(command, args, cwd) {
  const child = spawn(command, args, { cwd, stdio: 'inherit' })
  children.add(child)
  child.on('error', error => {
    console.error('Start error:', error.message)
    process.exitCode = 1
    stopAll()
  })
  child.on('exit', code => {
    children.delete(child)
    if (!stopping) {
      process.exitCode = code ?? 1
      stopAll()
    }
  })
  return child
}

function waitForBackend(child, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs

  return new Promise((resolve, reject) => {
    let settled = false
    const finish = error => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (error) reject(error)
      else resolve()
    }
    const timer = setTimeout(() => {
      finish(new Error('Backend did not become ready within 30 seconds.'))
    }, timeoutMs)

    child.once('exit', code => {
      finish(new Error(`Backend stopped before becoming ready (exit code ${code}).`))
    })

    const check = () => {
      if (settled) return
      const request = http.get('http://127.0.0.1:5000/api', response => {
        response.resume()
        if (response.statusCode === 200) {
          finish()
        } else {
          retry()
        }
      })
      request.setTimeout(1000, () => request.destroy())
      request.on('error', retry)
    }
    const retry = () => {
      if (!settled && Date.now() < deadline) setTimeout(check, 250)
    }

    check()
  })
}

async function main() {
  const backendProcess = start(python, [path.join(backend, 'app.py')], backend)
  try {
    await waitForBackend(backendProcess)
    console.log('Backend ready; starting Vite...')
    start(process.execPath, [vite, '--host', '127.0.0.1'], frontend)
  } catch (error) {
    console.error('Startup error:', error.message)
    process.exitCode = 1
    stopAll()
  }
}

process.on('SIGINT', stopAll)
process.on('SIGTERM', stopAll)
main()
