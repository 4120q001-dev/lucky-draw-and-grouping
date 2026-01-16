# Lucky Draw and Grouping Tool

A React application for lucky draws and grouping, powered by Google AI Studio.

## Setup & configuration

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Setup**:
    Create `.env.local` and add your API key:
    ```
    VITE_GOOGLE_AI_STUDIO_API_KEY=your_api_key_here
    ```
4.  **Run locally**:
    ```bash
    npm run dev
    ```

## Deployment

This project is configured to deploy to GitHub Pages.

1.  **Commit changes**:
    ```bash
    git add .
    git commit -m "Your commit message"
    ```
2.  **Deploy**:
    Pushes to `main` branch trigger the GitHub Actions workflow defined in `.github/workflows/deploy.yml`.
    
    Or manually deploy (if configured):
    ```bash
    npm run deploy
    ```

## Project Structure

- `components/`: React components
- `.github/workflows/`: CI/CD workflows
- `vite.config.ts`: Vite configuration

## Updates
- Configured `package.json` scripts and dependencies.
- Added `.gitignore` to exclude node_modules and secrets.
- Added GitHub Actions for automatic deployment to GitHub Pages.
