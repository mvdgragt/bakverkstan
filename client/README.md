# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
# Bakverkstan

## Configuration

Copy `.env.example` to `.env` to override the Instagram profile URL. The app
validates this public Vite setting with Zod and defaults to the Bakverkstan
profile when it is unset.

Shared navigation data is validated with Zod, and Zustand manages shared UI
state such as the mobile menu.

## Instagram gallery

The Bakverk page loads images from the server-side Instagram API endpoint.
The Instagram access token must stay on the server and is never sent to the
browser.

1. Copy `server/.env.example` to `server/.env` and set `INSTAGRAM_TOKEN` to a
   long-lived token for the Instagram professional account, with the
   `instagram_business_basic` permission. Keep this file private; it is
   excluded from Git.
2. Install and start the API server:

   ```sh
   cd server
   npm install
   npm run dev
   ```

3. In a second terminal, start the web app:

   ```sh
   cd client
   npm run dev
   ```

The gallery initially shows the latest page of images. Use **Visa fler bilder**
to load the remaining pages from Instagram, including individual images in
carousel posts. For production, build the client and then start the server
from the repository root:

```sh
cd client && npm run build
cd server && npm start
```

The server serves the built client and the API from the same origin.

For Vercel deployments with `client` as the project root, the API function is
in `client/api/instagram.js`. Add `INSTAGRAM_TOKEN` as a server-side Vercel
environment variable and redeploy. Do not add the token as a `VITE_` variable;
those are exposed in the browser bundle.
