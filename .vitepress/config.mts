import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Soroush Azari",
  description: "This is Soroush Azari Portfolio",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', 
        items: [
          { text: 'Lost Coordinates', link: '/projects/lost-coordinates' },
          { text: 'TG0013', link: '/projects/tg0013' },
          { text: 'Xat', link: '/projects/xat' },
          { text: 'L-System', link: '/projects/l-system' },
        ]
       },
    ],


    socialLinks: [
      { icon: 'github', link: 'https://github.com/smaooo' },
      { icon: 'linkedin', link: "https://www.linkedin.com/in/soroush-mohammadzadeh-azari/"}
    ]
  }
})
