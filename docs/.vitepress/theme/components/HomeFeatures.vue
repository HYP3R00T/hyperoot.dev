<script setup lang="ts">
import { useData } from 'vitepress'
import Features from './Features.vue'

const { frontmatter: fm } = useData()
</script>

<template>
    <h2 class="about-title">Projects</h2>
    <Features v-if="fm.modfeatures" class="HomeFeatures" :features="fm.modfeatures" />
    <!-- <pre>{{ JSON.stringify(fm, null, 2) }}</pre> -->
</template>

<style scoped>
.about-title {
    font-weight: 700;
    font-size: 2rem;
    margin: 0;
    margin-bottom: 1.5rem;
    color: var(--vp-c-text-1);
    border: 0px;
}

.HomeFeatures {
    margin: 0;
    padding: 0;
}
</style>