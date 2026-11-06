# Astro med React-öar i stället för en React-app

Webbplatsen byggs med Astro, och React och shadcn/ui används för komponenterna. Önskemålet var "React", men sajten är en innehållssajt med några få interaktiva delar: mobilmenyn och animationerna. Den ska ligga statiskt på GitHub Pages, och nyheterna ska vara Markdown som föreningen redigerar i Pages CMS. Astro ger färdig HTML per sida, nästan ingen JS till besökaren och Content Collections med ett schema som stoppar trasiga inlägg när sajten byggs.

## Övervägda alternativ

- **React Router v7 med prerender**: helt i React, men hela sidan hydreras och Markdown-hanteringen måste byggas själv. Det blir rätt val först om sajten ska bli en app med till exempel inloggning för faddrar.
- **Next.js**: i statiskt exportläge försvinner det mesta av det som gör ramverket värt att använda, och ramverket är byggt för hosting på Vercel.
- **Vite + React SPA**: sidorna är tomma tills JS har laddats, vilket ger dåliga förhandsvisningar när nyhetslänkar delas.
