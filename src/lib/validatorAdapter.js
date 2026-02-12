const BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL
  : '/'
const LIB_BASE = BASE.replace(/\/?$/, '/') + 'lib/'

let worker = null
let nextId = 0
const pending = new Map()

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./validatorWorker.js', import.meta.url), { type: 'module' })
    worker.onmessage = (e) => {
      const { id, type, errors, durationMs, version, message } = e.data
      const resolver = pending.get(id)
      if (!resolver) return
      pending.delete(id)
      if (type === 'error') {
        resolver.reject(new Error(message || 'Worker error'))
      } else if (type === 'result') {
        resolver.resolve({ errors, durationMs })
      } else if (type === 'version') {
        resolver.resolve(version ?? '')
      }
    }
    worker.onerror = (e) => {
      for (const [, { reject }] of pending) {
        reject(new Error(e.message || 'Worker error'))
      }
      pending.clear()
    }
  }
  return worker
}

function sendToWorker(type, payload = {}) {
  return new Promise((resolve, reject) => {
    const id = 'msg_' + (++nextId)
    pending.set(id, { resolve, reject })
    getWorker().postMessage({ id, type, libBase: LIB_BASE, ...payload })
  })
}

export const validationOptions = {
    "LIBSBML_CAT_GENERAL_CONSISTENCY": true,
    "LIBSBML_CAT_IDENTIFIER_CONSISTENCY": true,
    "LIBSBML_CAT_UNITS_CONSISTENCY": false,
    "LIBSBML_CAT_MATHML_CONSISTENCY": true,
    "LIBSBML_CAT_SBO_CONSISTENCY": true,
    "LIBSBML_CAT_OVERDETERMINED_MODEL": true,
    "LIBSBML_CAT_MODELING_PRACTICE": true,
    "LIBSBML_CAT_STRICT_UNITS_CONSISTENCY": false,
};

/**
 * Validate SBML string. Runs in a Web Worker so the main thread stays responsive.
 * @param {string} sbmlString - UTF-8 SBML document string
 * @returns {Promise<{ errors: Array<{ line?: number, column?: number, message: string, severity?: string, category?: string, errorId?: number, package?: string }>, durationMs: number }>}
 */
export async function validate(sbmlString) {
  return sendToWorker('validate', {
    sbmlString,
    options: validationOptions
  })
}

/**
 * Get the libSBML version from the validator module. Loads the module on first call.
 * @returns {Promise<string>} Version string, or empty string if not available
 */
export async function getLibSBMLVersion() {
  return sendToWorker('getVersion')
}
