# ✨ Welcome to Your Spark Template!
You've just launched your brand-new Spark Template Codespace — everything’s fired up and ready for you to explore, build, and create with Spark!

This template is your blank canvas. It comes with a minimal setup to help you get started quickly with Spark development.

🚀 What's Inside?
- A clean, minimal Spark environment
- Pre-configured for local development
- Ready to scale with your ideas
  
🧠 What Can You Do?

Right now, this is just a starting point — the perfect place to begin building and testing your Spark applications.

🧹 Just Exploring?
No problem! If you were just checking things out and don’t need to keep this code:

- Simply delete your Spark.
- Everything will be cleaned up — no traces left behind.

📄 License For Spark Template Resources 

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

## 🌐 Hosting the site live (GitHub Pages)

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds the Vite app and deploys it to GitHub Pages on every push to `main`.

To turn it on (one-time setup):

1. In GitHub, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` (or run the *Deploy to GitHub Pages* workflow manually from the **Actions** tab).
4. When the workflow finishes, the site URL is printed in the `deploy` job summary (typically `https://<owner>.github.io/<repo>/`).

The Vite config uses `base: './'` so the built site works from any sub-path. The workflow also copies `index.html` to `404.html` as an SPA fallback so client-side routes resolve correctly on Pages.

