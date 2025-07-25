<template>
    <section class="extra-section">
        <div class="extra-container">
            <h2 class="extra-title">Explore my Projects</h2>
        </div>
    </section>
</template>

<style scoped>
.extra-section {
    position: relative;
    padding: 0 24px;
}

@media (min-width: 640px) {
    .extra-section {
        padding: 0 48px;
    }
}

@media (min-width: 960px) {
    .extra-section {
        padding: 0 64px;
    }
}

.extra-container {
    margin: 0 auto;
    max-width: 1152px;
}

.extra-title {
    font-size: 1.8rem;
    font-weight: 700;
    line-height: 1.2;
    margin-block-end: var(--vp-space-4);
    padding: 2rem 0;
    text-align: center;
}

@media (min-width: 960px) {
    .extra-title {
        text-align: left;
    }
}
</style>
