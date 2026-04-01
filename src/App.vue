<!-- src/App.vue -->
<template>
  <router-view />
  <div class="app">
    <ValidatorApp />
  </div>
</template>

<script setup>
import ValidatorApp from './components/SbmlValidator.vue'
</script>

<style>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
