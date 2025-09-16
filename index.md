---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
pageClass: index-page   # adds a class to the layout wrapper

hero:
  name: "Portfolio"
  tagline: Technical Artist | Generalist Game Developer
  # actions:
  #   - theme: brand
  #     text: Markdown Examples
  #     link: /markdown-examples
  #   - theme: alt
  #     text: API Examples
  #     link: /api-examples

# features:
#   - title: Feature A
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#   - title: Feature B
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#   - title: Feature C
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---

<div style="display: flex; flex-direction: row; width: 100%; padding-top: 30px; ">
  <img src="./assets/me.png" style="height: 30vh; margin-left: -20px; margin-right: 20px;">
  <div>
   <h1> About Me </h1>
   <p style="word-wrap: break-word">
      As a Technical Artist and Tools Developer, I architect solutions that merge artistic creativity with engineering excellence. My expertise lies in building custom tools, authoring advanced shaders, and optimizing rendering pipelines to accelerate production workflows for teams and artists. With a passion for procedural content generation and post-processing, I have a proven track record of delivering scalable systems that enhance visual fidelity and boost team efficiency. My experience as both a Technical Artist and Game Developer provides me with a holistic understanding of the entire development lifecycle.
    </p>
  </div>
</div>


<script setup>
import ProjectCard from '/.vitepress/theme/components/ProjectCard.vue'
import CardGrid from '/.vitepress/theme/components/CardGrid.vue'
</script>

## Projects

<CardGrid>
  <ProjectCard
    href="/projects/cool-app"
    imgSrc="/images/cool-app.svg"
    title="Lost Coordinates"
  />
  <ProjectCard
    href="/projects/awesome-tool"
    imgSrc="./assets/tg0013/card.png"
    title="TG0013"
  />
  <ProjectCard
    href="/projects/another-one"
    imgSrc="./assets/xat/card.jpg"
    title="Xat"
  />

  <ProjectCard
    href="/projects/final-project"
    imgSrc="./assets/lsystem/card.png"
    title="L-System Blender Plugins"
  />
  
  <ProjectCard
    href="/projects/final-project"
    imgSrc="/images/final.svg"
    title="Unreal Engine Plugins"
  />
</CardGrid>
