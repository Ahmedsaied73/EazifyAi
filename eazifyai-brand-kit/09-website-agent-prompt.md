You are updating the EazifyAi website repo (TanStack Start, React 19, Tailwind v4 with custom CSS in src/styles.css).

GOAL: replace the old logo with the new brand mark and align the brand colours. Change nothing else: layout, copy, routes, forms, chat, admin, SEO titles and the WhatsApp number (only on the About page) stay as they are.

1) Logo mark: src/site/Logo.tsx. Replace the old hand / brackets / sparkle paths with the new mark below. ViewBox 0 0 240 240. Keep the exported component and props (size, animate, rich) and their behaviour, but adapt the rich motion to the new parts: the spark breathes (scale 1 to 1.08, 4s ease-in-out infinite), the brackets shift 2px outward and back on pointer hover, tiny grey stars keep rising as before. No orbit ring, no shine. Respect prefers-reduced-motion. Remove any old path constants that are no longer used.

   HAND group (fill = currentColor), transform="translate(0 -6)":
   <path d="M22 192 C38 178 68 172 98 166 C144 157 182 142 204 126 C216 118 228 130 218 140 C198 162 166 192 128 205 C94 216 50 212 30 200 C24 196 20 195 22 192 Z"/>
   <path d="M66 160 C70 142 96 128 124 128 C135 128 137 136 130 142 C119 152 100 162 84 165 C73 167 65 165 66 160 Z"/>
   LEFT bracket: <path d="M62 42 L32 70 L62 98" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
   RIGHT bracket: <path d="M178 42 L208 70 L178 98" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
   SPARK: <path d="M120 34 Q126 64 156 70 Q126 76 120 106 Q114 76 84 70 Q114 64 120 34 Z" fill="url(#ez-spark)"/>, with a linearGradient id="ez-spark" x1=0 y1=0 x2=1 y2=1, stop #72C7F5 at 0 and #398BFF at 1. Give the gradient a unique id per rendered instance if the component can appear twice on one page.

2) Wordmark: keep the site's live text wordmark (Geist: "Eazify" + "Ai"). Colour "Ai" #72C7F5 on dark and #398BFF on light. Do not convert it to paths.

3) Brand colours in src/styles.css tokens: accent sky becomes #72C7F5; glow and gradient use #398BFF and #8065D5; dark background #050608; primary text #F4F5F7 on dark and #050608 on light. Keep the layout and spacing as they are.

4) Favicon: replace public/favicon.svg with the file 08-favicon/favicon.svg from the attached brand kit. Add public/apple-touch-icon.png from 08-favicon/apple-touch-icon-180.png, and in src/routes/__root.tsx head add <link rel="apple-touch-icon" href="/apple-touch-icon.png">.

5) Share image (WhatsApp, Facebook, LinkedIn previews): replace public/og.png with 02-social/og-image-1200x630.png from the brand kit. src/app-meta.json already points og_image_url to /og.png; keep that. Keep og:image:width 1200 and og:image:height 630.

6) src/routes/brand.tsx: replace the old lockups with the new mark (horizontal, stacked, small mark, dark and light), or remove the page content that shows the old logo. Keep the route.

7) If the brand kit files are not reachable from this session, use the SVG paths above for the logo and generate favicon.svg from the same mark on a #050608 rounded square. Tell me clearly which binary files (og.png, apple-touch-icon.png) still need uploading by hand.

VERIFY before deploying: bun run typecheck passes, bun run build passes, and the header is checked at 390px and 1440px in both dark and light themes. Commit with a clear message, push, then deploy the website.
