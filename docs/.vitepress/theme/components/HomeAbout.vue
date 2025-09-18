<script setup lang="ts">
import { VPButton } from 'vitepress/theme'
</script>

<template>
  <section class="about-section">
    <div class="about-container">
      <h2 class="about-title">👋 Hi, I'm Rajesh</h2>
      <div class="about-text">
        <p>
          As a self-taught DevOps Engineer, I enjoy building scalable
          infrastructure, automating workflows, and sharing what I learn along
          the way. I’m passionate about open source, cloud technologies, and
          helping teams deliver reliable software faster.
        </p>
        <div class="action">
          <VPButton theme="brand" text="Let's Connect" href="https://rajeshdas.dev" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  border-radius: 24px;
  background-color: var(--vp-c-bg-elv);
  padding: 0 1rem;
}

.about-title {
  font-weight: 700;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: var(--vp-c-text-1);
  border: 0px;
}

.about-text {
  font-size: 1rem;
  color: var(--vp-c-text-2);
  padding-bottom: 2rem;
}

.action {
  padding: 1rem 0;
}

.action > * {
  text-decoration: none;
}
</style>
