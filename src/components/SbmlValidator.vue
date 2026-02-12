<template>
  <div
    class="sbml-validator"
    :class="{ 'is-dragging': isDragging }"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <section class="input-section">
      <label class="label">SBML document</label>
      <p class="hint">Paste SBML below, upload a file, or drop a file here.</p>
      <textarea
        v-model="sbmlInput"
        class="textarea"
        rows="12"
        placeholder="Paste SBML XML here..."
        spellcheck="false"
        @input="onTextareaInput"
      />
      <div class="options-section">
        <button
          type="button"
          class="options-toggle"
          :aria-expanded="!optionsCollapsed"
          @click="optionsCollapsed = !optionsCollapsed"
        >
          <span class="options-toggle-icon" :class="{ expanded: !optionsCollapsed }">▸</span>
          <span class="options-toggle-label">Validation options</span>
        </button>
        <div v-show="!optionsCollapsed" class="options-content">
          <p class="hint">Toggle which consistency checks to run.</p>
          <div class="options-grid">
            <label
              v-for="(value, key) in validationOptions"
              :key="key"
              class="option-label"
            >
              <input
                v-model="validationOptions[key]"
                type="checkbox"
                class="option-checkbox"
              />
              <span class="option-text">{{ optionLabel(key) }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="actions">
        <input
          ref="fileInputRef"
          type="file"
          accept=".xml,.sbml,text/xml,application/xml,application/sbml+xml"
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
          <span v-if="validating" class="spinner" aria-hidden="true" />
          {{ validateButtonLabel }}
        </button>
      </div>
      <div v-if="validating" class="validating-banner">
        <span class="spinner" aria-hidden="true" />
        <span>Validating… This may take a while for large models.</span>
      </div>
      <p v-if="loadError" class="error-msg">{{ loadError }}</p>
      <p v-if="validationError" class="error-msg">{{ validationError }}</p>
    </section>

    <section v-if="hasResult" class="results-section">
      <h2 class="results-heading">Results:</h2>
      <p class="model-title">Model: {{ modelTitle }}</p>
      <p class="validation-time">Time taken for validation: {{ formattedDuration }}</p>

      <div
        class="status-banner"
        :class="statusBannerClass"
      >
        {{ statusBannerText }}
      </div>

      <template v-if="result.errors.length > 0">
        <div class="error-list-header">
          <h3 class="error-count">{{ filteredErrorCountLabel }}</h3>
          <label v-if="hasWarningsInResult" class="filter-warnings-label">
            <input v-model="showWarnings" type="checkbox" class="filter-warnings-checkbox" />
            Show warnings
          </label>
          <button
            type="button"
            class="btn btn-filter"
            title="Filter by package or category"
            @click="filterDialogOpen = true"
          >
            Filter
          </button>
        </div>
        <div v-show="filterDialogOpen" class="filter-dialog-overlay" @click.self="filterDialogOpen = false">
          <div class="filter-dialog-inner" role="dialog" aria-modal="true" aria-labelledby="filter-dialog-title">
            <h4 id="filter-dialog-title" class="filter-dialog-title">Filter errors</h4>
            <p class="filter-dialog-hint">Remove packages or categories to hide those errors from the list.</p>
            <div v-if="visiblePackages.length > 0" class="filter-section">
              <h5 class="filter-section-title">Packages</h5>
              <div class="filter-chips">
                <span
                  v-for="pkg in visiblePackages"
                  :key="'pkg-' + pkg"
                  class="filter-chip"
                >
                  {{ pkg }}
                  <button
                    type="button"
                    class="filter-chip-remove"
                    :aria-label="'Hide ' + pkg + ' errors'"
                    @click="hidePackage(pkg)"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>
            <div v-if="visibleCategories.length > 0" class="filter-section">
              <h5 class="filter-section-title">Categories</h5>
              <div class="filter-chips">
                <span
                  v-for="cat in visibleCategories"
                  :key="'cat-' + cat"
                  class="filter-chip"
                >
                  {{ cat }}
                  <button
                    type="button"
                    class="filter-chip-remove"
                    :aria-label="'Hide ' + cat + ' errors'"
                    @click="hideCategory(cat)"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>
            <div v-if="hiddenPackages.length > 0 || hiddenCategories.length > 0" class="filter-section filter-section-hidden">
              <h5 class="filter-section-title">Hidden (click to restore)</h5>
              <div class="filter-chips">
                <span
                  v-for="pkg in hiddenPackages"
                  :key="'hidden-pkg-' + pkg"
                  class="filter-chip filter-chip-hidden"
                >
                  {{ pkg }}
                  <button
                    type="button"
                    class="filter-chip-restore"
                    :aria-label="'Restore ' + pkg + ' errors'"
                    @click="restorePackage(pkg)"
                  >
                    +
                  </button>
                </span>
                <span
                  v-for="cat in hiddenCategories"
                  :key="'hidden-cat-' + cat"
                  class="filter-chip filter-chip-hidden"
                >
                  {{ cat }}
                  <button
                    type="button"
                    class="filter-chip-restore"
                    :aria-label="'Restore ' + cat + ' errors'"
                    @click="restoreCategory(cat)"
                  >
                    +
                  </button>
                </span>
              </div>
            </div>
            <div class="filter-dialog-actions">
              <button
                v-if="hiddenPackages.length > 0 || hiddenCategories.length > 0"
                type="button"
                class="btn btn-secondary"
                @click="resetFilters"
              >
                Reset filters
              </button>
              <button type="button" class="btn btn-primary" @click="filterDialogOpen = false">
                Close
              </button>
            </div>
          </div>
        </div>
        <div v-if="filteredErrors.length > ERRORS_PER_PAGE" class="pagination-bar">
          <span class="pagination-label">{{ paginationLabel }}</span>
          <div class="pagination-buttons">
            <button
              type="button"
              class="btn btn-secondary btn-pagination"
              :disabled="errorPage <= 1"
              @click="errorPage = Math.max(1, errorPage - 1)"
            >
              Previous
            </button>
            <span class="pagination-page">Page {{ errorPage }} of {{ totalPages }}</span>
            <button
              type="button"
              class="btn btn-secondary btn-pagination"
              :disabled="errorPage >= totalPages"
              @click="errorPage = Math.min(totalPages, errorPage + 1)"
            >
              Next
            </button>
          </div>
        </div>
        <ol class="error-list">
          <li v-for="(err, idx) in paginatedErrors" :key="(errorPage - 1) * ERRORS_PER_PAGE + idx" class="error-item">
            <span class="error-index">{{ (errorPage - 1) * ERRORS_PER_PAGE + idx + 1 }}.</span>
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
            <div v-if="err.category || err.errorId != null || err.package" class="error-meta">
              <span v-if="err.category" class="error-meta-item">Category: {{ err.category }}</span>
              <span v-if="err.errorId != null" class="error-meta-item">ID: {{ err.errorId }}</span>
              <span v-if="err.package" class="error-meta-item">Package: {{ err.package }}</span>
            </div>
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

    <footer class="status-footer">
      <span class="status-label">Library:</span>
      <span v-if="libVersionLoading" class="status-value">Loading…</span>
      <span v-else-if="libVersionError" class="status-value status-error">{{ libVersionError }}</span>
      <span v-else class="status-value">{{ libVersion || '—' }}</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, reactive, onMounted, watch, onUnmounted } from 'vue'
import { validate as validateSbml, getLibSBMLVersion, validationOptions as validationOptionsRef } from '../lib/validatorAdapter.js'

const validationOptions = reactive(validationOptionsRef)
const optionsCollapsed = ref(true)

const sbmlInput = ref('')
const isDragging = ref(false)
const modelTitle = ref('Pasted SBML')
const fileInputRef = ref(null)
const loadError = ref('')
const validationError = ref('')
const validating = ref(false)
const result = ref(null)
const validatedDocument = ref('')
const showWarnings = ref(true)
const filterDialogOpen = ref(false)
const hiddenPackages = ref([])
const hiddenCategories = ref([])
const libVersion = ref('')
const libVersionLoading = ref(true)
const libVersionError = ref('')

const ERRORS_PER_PAGE = 100
const errorPage = ref(1)

const canValidate = computed(() => {
  return sbmlInput.value.trim().length > 0 && !validating.value
})

const validateButtonLabel = computed(() => {
  if (validating.value) return 'Validating...'
  return 'Validate'
})

const hasResult = computed(() => result.value !== null)

const hasValidationErrors = computed(() => {
  if (!result.value || !result.value.errors.length) return false
  return result.value.errors.some(e => (e.severity || 'error') !== 'warning')
})

const hasOnlyWarnings = computed(() => {
  if (!result.value || !result.value.errors.length) return false
  return result.value.errors.every(e => (e.severity || 'error') === 'warning')
})

const statusBannerClass = computed(() => {
  if (hasValidationErrors.value) return 'status-invalid'
  if (hasOnlyWarnings.value) return 'status-warning'
  return 'status-valid'
})

const statusBannerText = computed(() => {
  if (hasValidationErrors.value) return 'This document is not valid SBML!'
  if (hasOnlyWarnings.value) return 'This document is valid SBML but contains warnings.'
  return 'This document is valid SBML.'
})

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

const hasWarningsInResult = computed(() => {
  if (!result.value || !result.value.errors.length) return false
  return result.value.errors.some(e => (e.severity || 'error') === 'warning')
})

const allPackages = computed(() => {
  if (!result.value || !result.value.errors.length) return []
  const set = new Set()
  for (const e of result.value.errors) {
    if (e.package) set.add(e.package)
  }
  return [...set].sort()
})

const allCategories = computed(() => {
  if (!result.value || !result.value.errors.length) return []
  const set = new Set()
  for (const e of result.value.errors) {
    if (e.category) set.add(e.category)
  }
  return [...set].sort()
})

const visiblePackages = computed(() => {
  const hidden = new Set(hiddenPackages.value)
  return allPackages.value.filter(p => !hidden.has(p))
})

const visibleCategories = computed(() => {
  const hidden = new Set(hiddenCategories.value)
  return allCategories.value.filter(c => !hidden.has(c))
})

const filteredErrors = computed(() => {
  if (!result.value || !result.value.errors.length) return []
  let list = result.value.errors
  if (!showWarnings.value) {
    list = list.filter(e => (e.severity || 'error') !== 'warning')
  }
  const hiddenPkg = new Set(hiddenPackages.value)
  const hiddenCat = new Set(hiddenCategories.value)
  return list.filter(e => {
    if (e.package && hiddenPkg.has(e.package)) return false
    if (e.category && hiddenCat.has(e.category)) return false
    return true
  })
})

const totalPages = computed(() => {
  const n = filteredErrors.value.length
  return n === 0 ? 1 : Math.ceil(n / ERRORS_PER_PAGE)
})

const paginatedErrors = computed(() => {
  const list = filteredErrors.value
  if (!list.length) return []
  const start = (errorPage.value - 1) * ERRORS_PER_PAGE
  return list.slice(start, start + ERRORS_PER_PAGE)
})

const paginationLabel = computed(() => {
  const total = filteredErrors.value.length
  if (total === 0) return ''
  const start = (errorPage.value - 1) * ERRORS_PER_PAGE + 1
  const end = Math.min(errorPage.value * ERRORS_PER_PAGE, total)
  return total <= ERRORS_PER_PAGE
    ? `Showing all ${total}`
    : `Showing ${start}–${end} of ${total}`
})

const errorCountLabel = computed(() => {
  if (!result.value || !result.value.errors.length) return ''
  const n = result.value.errors.length
  const warnings = result.value.errors.filter(e => (e.severity || 'error') === 'warning').length
  const errors = n - warnings
  const parts = []
  if (errors) parts.push(`${errors} Error${errors !== 1 ? 's' : ''}`)
  if (warnings) parts.push(`${warnings} Warning${warnings !== 1 ? 's' : ''}`)
  return parts.join(', ')
})

const filteredErrorCountLabel = computed(() => {
  if (!result.value || !result.value.errors.length) return ''
  const list = filteredErrors.value
  const warnings = list.filter(e => (e.severity || 'error') === 'warning').length
  const errors = list.length - warnings
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
  if (!filteredErrors.value.length) return set
  for (const e of filteredErrors.value) {
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

function onFilterDialogKeydown(e) {
  if (e.key === 'Escape') filterDialogOpen.value = false
}

watch(filteredErrors, () => {
  errorPage.value = 1
})

watch(filterDialogOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', onFilterDialogKeydown)
  } else {
    document.removeEventListener('keydown', onFilterDialogKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onFilterDialogKeydown)
})

onMounted(async () => {
  libVersionLoading.value = true
  libVersionError.value = ''
  try {
    libVersion.value = await getLibSBMLVersion()
  } catch (e) {
    libVersionError.value = e?.message || 'Failed to load version'
  } finally {
    libVersionLoading.value = false
  }
})

function optionLabel(key) {
  return key
    .replace(/^LIBSBML_CAT_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

function isAcceptableFile(file) {
  if (!file || typeof file.name !== 'string') return false
  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()
  return (
    name.endsWith('.xml') ||
    name.endsWith('.sbml') ||
    type === 'text/xml' ||
    type === 'application/xml'
  )
}

function onDragOver() {
  isDragging.value = true
}

function onDragLeave(ev) {
  if (!ev.currentTarget.contains(ev.relatedTarget)) {
    isDragging.value = false
  }
}

async function onDrop(ev) {
  isDragging.value = false
  const files = ev.dataTransfer?.files
  if (!files?.length) return
  const file = Array.from(files).find(isAcceptableFile) ?? files[0]
  const text = await readFileAsText(file)
  if (text == null) return
  modelTitle.value = file.name
  sbmlInput.value = text
  await nextTick()
  await runValidation()
}

function readFileAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
    reader.onerror = () => resolve(null)
    reader.readAsText(file, 'UTF-8')
  })
}

function triggerUpload() {
  fileInputRef.value?.click()
}

function onFileSelect(ev) {
  const file = ev.target.files?.[0]
  if (!file) return
  modelTitle.value = file.name
  const reader = new FileReader()
  reader.onload = () => {
    sbmlInput.value = typeof reader.result === 'string' ? reader.result : ''
  }
  reader.readAsText(file, 'UTF-8')
  ev.target.value = ''
}

function onTextareaInput() {
  modelTitle.value = 'Pasted SBML'
}

function hidePackage(pkg) {
  if (!hiddenPackages.value.includes(pkg)) {
    hiddenPackages.value = [...hiddenPackages.value, pkg]
  }
}

function hideCategory(cat) {
  if (!hiddenCategories.value.includes(cat)) {
    hiddenCategories.value = [...hiddenCategories.value, cat]
  }
}

function restorePackage(pkg) {
  hiddenPackages.value = hiddenPackages.value.filter(p => p !== pkg)
}

function restoreCategory(cat) {
  hiddenCategories.value = hiddenCategories.value.filter(c => c !== cat)
}

function resetFilters() {
  hiddenPackages.value = []
  hiddenCategories.value = []
}

async function runValidation() {
  const input = sbmlInput.value.trim()
  if (!input) return
  loadError.value = ''
  validationError.value = ''
  result.value = null
  validatedDocument.value = input
  hiddenPackages.value = []
  hiddenCategories.value = []
  validating.value = true
  await nextTick()
  await new Promise(r => { requestAnimationFrame(() => requestAnimationFrame(r)) })
  await new Promise(r => setTimeout(r, 0))
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
  position: relative;
  transition: outline 0.15s ease, background 0.15s ease;
}

.sbml-validator.is-dragging {
  outline: 2px dashed #0066cc;
  outline-offset: -2px;
  background: #e6f2ff;
}

.options-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.options-toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
  padding: 0.25rem 0;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  color: inherit;
}

.options-toggle:hover {
  color: #0066cc;
}

.options-toggle-icon {
  display: inline-block;
  transition: transform 0.2s ease;
  font-size: 12px;
  color: #666;
}

.options-toggle-icon.expanded {
  transform: rotate(90deg);
}

.options-content {
  margin-top: 0.5rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.5rem 1.5rem;
  margin-top: 0.5rem;
}

.option-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  font-weight: normal;
  user-select: none;
}

.option-checkbox {
  cursor: pointer;
  flex-shrink: 0;
}

.option-text {
  font-size: 13px;
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
  color: black;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #0066cc;
  color: white;
  border-color: #0066cc;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.validating-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  margin-top: 1rem;
  background: #e8f4ff;
  border: 1px solid #0066cc;
  border-radius: 6px;
  font-weight: 500;
  color: #004494;
}

.validating-banner .spinner {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border: 3px solid rgba(0, 102, 204, 0.3);
  border-top-color: #0066cc;
}

.spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.model-title {
  margin: 0 0 0.25rem 0;
  color: #555;
  font-size: 0.95rem;
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

.status-warning {
  background: #e68a00;
  color: white;
}

.error-list-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.error-count {
  font-size: 1rem;
  margin: 0;
}

.filter-warnings-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  font-weight: normal;
  user-select: none;
}

.filter-warnings-checkbox {
  cursor: pointer;
}

.btn-filter {
  margin-left: auto;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.pagination-label {
  font-size: 13px;
  color: #555;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-pagination {
  padding: 0.3rem 0.6rem;
  font-size: 13px;
}

.pagination-page {
  font-size: 13px;
  color: #555;
}

.filter-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.filter-dialog-inner {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  max-width: 90vw;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.filter-dialog-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.filter-dialog-hint {
  margin: 0 0 1rem 0;
  color: #555;
  font-size: 13px;
}

.filter-section {
  margin-bottom: 1rem;
}

.filter-section-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #e8e8e8;
  border-radius: 4px;
  font-size: 13px;
}

.filter-chip-hidden {
  background: #f0f0f0;
  color: #888;
}

.filter-chip-remove,
.filter-chip-restore {
  padding: 0 0.2rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  color: #666;
  border-radius: 2px;
}

.filter-chip-remove:hover,
.filter-chip-restore:hover {
  background: #ddd;
  color: #333;
}

.filter-chip-restore {
  font-size: 14px;
  font-weight: 600;
}

.filter-dialog-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
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

.error-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.35rem;
  font-size: 12px;
  color: #666;
}

.error-meta-item {
  white-space: nowrap;
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

.status-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 13px;
  color: #666;
}

.status-label {
  font-weight: 600;
  margin-right: 0.35rem;
}

.status-value.status-error {
  color: #c00;
}
</style>
