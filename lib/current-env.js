const process = require('node:process')
const nodeOs = require('node:os')

function isMusl (file) {
  return file.includes('libc.musl-') || file.includes('ld-musl-')
}

function os () {
  return process.platform
}

function cpu () {
  return process.arch
}

let family
if (os() === 'linux') {
  const originalExclude = process.report.excludeNetwork
  process.report.excludeNetwork = true
  const report = process.report.getReport()
  process.report.excludeNetwork = originalExclude
  if (report.header?.glibcVersionRuntime) {
    family = 'glibc'
  } else if (Array.isArray(report.sharedObjects) && report.sharedObjects.some(isMusl)) {
    family = 'musl'
  }
}
function libc (osName) {
  if (osName !== 'linux') {
    return undefined
  }
  return family
}

function devEngines (env = {}) {
  const osName = env.os || os()
  return {
    cpu: {
      name: env.cpu || cpu(),
    },
    libc: {
      name: env.libc || libc(osName),
    },
    os: {
      name: osName,
      version: env.osVersion || nodeOs.release(),
    },
    packageManager: {
      name: 'npm',
      version: env.npmVersion,
    },
    runtime: {
      name: 'node',
      version: env.nodeVersion || process.version,
    },
  }
}

module.exports = {
  cpu,
  libc,
  os,
  devEngines,
}
