<template>
  <div class="sbml-validator">
    <section class="input-section">
      <label class="label">SBML document</label>
      <p class="hint">Paste SBML below or upload a file.</p>
      <textarea
        v-model="sbmlInput"
        class="textarea"
        rows="12"
        placeholder="Paste SBML XML here..."
        spellcheck="false"
      />
      <div class="actions">
        <input
          ref="fileInputRef"
          type="file"
          accept=".xml,.sbml,text/xml,application/xml"
          class="file-input"
          @change="onFileSelect"
        />
        <button type="button" class="btn btn-secondary" @click="triggerUpload">
          Upload file
        </button>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!canValidate"
          @click="runValidation"
        >
          {{ validateButtonLabel }}
        </button>
      </div>
      <p v-if="loadError" class="error-msg">{{ loadError }}</p>
      <p v-if="validationError" class="error-msg">{{ validationError }}</p>
    </section>

    <section v-if="hasResult" class="results-section">
      <h2 class="results-heading">Results:</h2>
      <p class="validation-time">Time taken for validation: {{ formattedDuration }}</p>

      <div
        class="status-banner"
        :class="result.errors.length > 0 ? 'status-invalid' : 'status-valid'"
      >
        {{ result.errors.length > 0 ? 'This document is not valid SBML!' : 'This document is valid SBML.' }}
      </div>

      <template v-if="result.errors.length > 0">
        <h3 class="error-count">{{ errorCountLabel }}</h3>
        <ol class="error-list">
          <li v-for="(err, idx) in result.errors" :key="idx" class="error-item">
            <span class="error-index">{{ idx + 1 }}.</span>
            <span
              class="severity-badge"
              :class="err.severity === 'warning' ? 'badge-warning' : 'badge-error'"
            >
              {{ (err.severity || 'error').charAt(0).toUpperCase() + (err.severity || 'error').slice(1) }}
            </span>
            <span class="error-location">
              <template v-if="err.line != null">
                <a
                  :href="'#doc-line-' + err.line"
                  class="error-location-link"
                  @click.prevent="scrollToLine(err.line)"
                >
                  Line {{ err.line }}{{ err.column != null ? ` Column ${err.column}` : '' }}
                </a>:
              </template>
              <template v-else>
                Line ?{{ err.column != null ? ` Column ${err.column}` : '' }}:
              </template>
            </span>
            <p class="error-message">{{ err.message }}</p>
            <div v-if="snippetForError(err)" class="error-snippet">
              {{ snippetForError(err) }}
            </div>
          </li>
        </ol>
      </template>

      <h3 class="document-listing-heading">Document Listing</h3>
      <div class="document-listing">
        <div
          v-for="(line, i) in documentLines"
          :key="i"
          :id="'doc-line-' + (i + 1)"
          class="document-line"
          :class="{ 'line-error': errorLineSet.has(i + 1) }"
        >
          <span class="line-num">{{ i + 1 }}.</span>
          <span class="line-content">{{ line }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { validate as validateSbml } from '../lib/validatorAdapter.js'

const sbmlInput = ref('')
const fileInputRef = ref(null)
const loadError = ref('')
const validationError = ref('')
const validating = ref(false)
const result = ref(null)
const validatedDocument = ref('')

const canValidate = computed(() => {
  return sbmlInput.value.trim().length > 0 && !validating.value
})

const validateButtonLabel = computed(() => {
  if (validating.value) return 'Validating...'
  return 'Validate'
})

const hasResult = computed(() => result.value !== null)

const formattedDuration = computed(() => {
  if (result.value == null) return ''
  const ms = result.value.durationMs
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const frac = Math.round(ms % 1000)
  const pad = (n, len = 2) => String(n).padStart(len, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}.${String(frac).padStart(3, '0')}`
})

const errorCountLabel = computed(() => {
  if (!result.value || !result.value.errors.length) return ''
  const n = result.value.errors.length
  const warnings = result.value.errors.filter(e => e.severity === 'warning').length
  const errors = n - warnings
  const parts = []
  if (errors) parts.push(`${errors} Error${errors !== 1 ? 's' : ''}`)
  if (warnings) parts.push(`${warnings} Warning${warnings !== 1 ? 's' : ''}`)
  return parts.join(', ')
})

const documentLines = computed(() => {
  const doc = validatedDocument.value || ''
  if (!doc) return []
  return doc.split(/\r?\n/)
})

const errorLineSet = computed(() => {
  const set = new Set()
  if (!result.value || !result.value.errors.length) return set
  for (const e of result.value.errors) {
    if (e.line != null) set.add(Number(e.line))
  }
  return set
})

function scrollToLine(lineNum) {
  const el = document.getElementById('doc-line-' + lineNum)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function snippetForError(err) {
  const doc = validatedDocument.value || ''
  if (!doc || err.line == null) return ''
  const lines = doc.split(/\r?\n/)
  const lineIndex = Math.max(0, Number(err.line) - 1)
  return lines[lineIndex] ?? ''
}

function triggerUpload() {
  fileInputRef.value?.click()
}

function onFileSelect(ev) {
  const file = ev.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    sbmlInput.value = typeof reader.result === 'string' ? reader.result : ''
  }
  reader.readAsText(file, 'UTF-8')
  ev.target.value = ''
}

async function runValidation() {
  const input = sbmlInput.value.trim()
  if (!input) return
  loadError.value = ''
  validationError.value = ''
  result.value = null
  validatedDocument.value = input
  validating.value = true
  try {
    result.value = await validateSbml(input)
  } catch (e) {
    if (e.message && e.message.includes('not loaded')) {
      loadError.value = e.message
    } else {
      validationError.value = e.message || 'Validation failed.'
    }
  } finally {
    validating.value = false
  }
}
</script>

<style scoped>
.sbml-validator {
  font-family: system-ui, sans-serif;
  font-size: 14px;
}

.label {
  font-weight: 600;
  display: block;
  margin-bottom: 0.25rem;
}

.hint {
  color: #555;
  margin: 0 0 0.5rem 0;
}

.textarea {
  width: 100%;
  box-sizing: border-box;
  font-family: ui-monospace, monospace;
  font-size: 13px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.btn {
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #0066cc;
  color: white;
  border-color: #0066cc;
}

.btn-secondary {
  background: #fff;
}

.error-msg {
  color: #c00;
  margin-top: 0.5rem;
}

.results-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.results-heading {
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0;
}

.validation-time {
  margin: 0 0 1rem 0;
  color: #333;
}

.status-banner {
  padding: 0.75rem 1rem;
  text-align: center;
  font-weight: 600;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.status-invalid {
  background: #c00;
  color: white;
}

.status-valid {
  background: #0a0;
  color: white;
}

.error-count {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.error-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
}

.error-item {
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.error-index {
  margin-right: 0.25rem;
}

.severity-badge {
  display: inline-block;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 0.5rem;
}

.badge-error {
  background: #c00;
  color: white;
}

.badge-warning {
  background: #e68a00;
  color: white;
}

.error-location {
  font-weight: 600;
}

.error-location-link {
  color: #0066cc;
  text-decoration: none;
  cursor: pointer;
  border-bottom: 1px solid transparent;
}

.error-location-link:hover {
  text-decoration: underline;
}

.error-message {
  margin: 0.35rem 0 0 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-snippet {
  margin-top: 0.35rem;
  padding: 0.4rem 0.6rem;
  background: #e8e8e8;
  font-family: ui-monospace, monospace;
  font-size: 12px;
  border-radius: 3px;
  overflow-x: auto;
}

.document-listing-heading {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.document-listing {
  background: #f5f5f5;
  padding: 0.5rem 0;
  border-radius: 4px;
  font-family: ui-monospace, monospace;
  font-size: 12px;
  overflow-x: auto;
}

.document-line {
  padding: 0.1rem 0.5rem;
  white-space: pre;
}

.document-line.line-error {
  background: #e0e0e0;
}

.line-num {
  display: inline-block;
  min-width: 2.5em;
  margin-right: 0.5rem;
  color: #666;
  user-select: none;
}

.line-content {
  white-space: pre;
}
</style>
