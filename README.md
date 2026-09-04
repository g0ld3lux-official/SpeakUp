# SpeakUp AI

A clean-room speaking-coach web app inspired by the *feature set* of modern speaking-coach apps. It does not copy proprietary code, assets, or branding.

## What works
- Browser microphone recording
- Timed speaking prompts
- Audio upload to `/api/transcribe`
- Speech-to-text using OpenAI transcription
- AI scoring at `/api/evaluate`
- Filler-word estimate, WPM, strengths and improvements
- Turn-based AI simulators at `/api/simulator`
- Local XP/streak/session history
- No paywall in the app UI

## Important
The AI API is not free simply because the site has no paywall. You supply your own API key as a Cloudflare secret. Never paste the key into `index.html` or JavaScript shipped to the browser.

Raw audio is not stored by this app. It is uploaded to the transcription endpoint for processing and then discarded by the function. The app stores the resulting transcript/feedback locally in the browser unless you add a cloud database.

## Environment secret
Cloudflare Pages: Settings -> Variables and Secrets -> add secret `OPENAI_API_KEY`.
Optional variable: `OPENAI_MODEL` (defaults to `gpt-5.6-luna`).

## Deploy
Use GitHub integration because Pages Functions are not supported by Direct Upload. Create a GitHub repo, upload this folder, then Cloudflare Dashboard -> Workers & Pages -> Create application -> Pages -> Connect to Git.

Build command: `exit 0`
Build output directory: `.`
Production branch: `main`

Then add the secret and redeploy.
