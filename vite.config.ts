import { existsSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Public base path.
 *
 * A GitHub Pages *project* site is served from `https://<user>.github.io/<repo>/`,
 * so every asset URL needs that prefix or the page loads blank. In CI we derive
 * it from `GITHUB_REPOSITORY` ("owner/repo") so nothing has to be hardcoded.
 *
 * Three cases resolve to the root instead:
 *   · a custom domain — the presence of public/CNAME is the signal, so adding
 *     or removing a domain needs no config change here;
 *   · a user/org site (`<user>.github.io`);
 *   · local builds and Vercel/Netlify/Cloudflare, which have no GITHUB_REPOSITORY.
 *
 * Override with `VITE_BASE=/whatever/ npm run build` if you ever need to.
 */
function resolveBase(): string {
  if (process.env.VITE_BASE) return process.env.VITE_BASE;

  // A CNAME file means Pages serves this site from the domain root.
  if (existsSync(fileURLToPath(new URL("./public/CNAME", import.meta.url)))) return "/";

  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) return "/";

  const [owner, name] = repository.split("/");
  if (!name) return "/";
  if (name.toLowerCase() === `${owner.toLowerCase()}.github.io`) return "/";
  return `/${name}/`;
}

// https://vite.dev/config/
export default defineConfig({
  base: resolveBase(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Keep the heavy WebGL runtime in its own chunk so the initial paint
        // never waits on it (the 3D scenes are lazy-loaded behind Suspense).
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](three|@react-three)[\\/]/.test(id)) return "three";
          if (/[\\/]node_modules[\\/](framer-motion|motion|motion-dom|motion-utils)[\\/]/.test(id))
            return "motion";
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          return "vendor";
        },
      },
    },
  },
});
