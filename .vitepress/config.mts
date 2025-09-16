import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Soroush Azari",
  description: "This is Soroush Azari Portfolio",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],


    socialLinks: [
      { icon: 'github', link: 'https://github.com/smaooo' },
      { icon: 'linkedin', link: "https://www.linkedin.com/in/soroush-mohammadzadeh-azari/"}
    ]
  }
})
