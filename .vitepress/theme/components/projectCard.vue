<script setup>
defineProps({
  href: String,
  imgSrc: String,
  title: String,
})
</script>

<template>
  <a :href="href" class="project-card">
    <img :src="imgSrc" :alt="title" class="card-image" />
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
    </div>
  </a>
</template>

<style scoped>
.project-card {
  display: block;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
  transition: border-color 0.25s;
  text-decoration: none;
  color: inherit;
  /* Add overflow: hidden to respect the parent's border-radius */
  overflow: hidden; 
}
.project-card:hover {
  border-color: var(--vp-c-brand-1);
}

.card-image {
  /* This makes the image a responsive square */
  aspect-ratio: 1 / 1;
  width: 100%;
  /* This ensures the image fills the square space without stretching */
  object-fit: cover;
  display: block;
}

.card-content {
  /* Add padding only to the content area below the image */
  padding: 16px;
}

.card-title {
  /* Reset default margins and ensure left-alignment */
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: left;
}
</style>