const { spawn } = require('node:child_process')
const path = require('node:path')

const root = __dirname
const frontend = path.join(root, 'frontend')
const python = process.platform === 'win32'
  ? path.join(root, '.venv', 'Scripts', 'python.exe')
  : path.join(root, '.venv', 'bin', 'python')
const vite = path.join(frontend, 'node_modules', 'vite', 'bin', 'vite.js')

// Frontend apne folder se chalao; backend project root se chalta hai.
const children = [
  spawn(process.execPath, [vite, '--host', '127.0.0.1'], { cwd: frontend, stdio: 'inherit' }),
  spawn(python, ['app.py'], { cwd: root, stdio: 'inherit' }),
]

// Kisi ek process ke band hone par doosre ko bhi band kar do.
function stopAll() {
  for (const child of children) child.kill()
}

for (const child of children) {
  child.on('error', error => {
    console.error('Start error:', error.message)
    stopAll()
    process.exitCode = 1
  })
  child.on('exit', code => {
    if (code && code !== 0) {
      process.exitCode = code
      stopAll()
    }
  })
}

process.on('SIGINT', stopAll)
process.on('SIGTERM', stopAll)
