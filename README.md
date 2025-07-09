# SceneForge AI

Craft compelling script scenes with the power of AI. From a spark of an idea to a full-fledged scene, SceneForge AI provides the tools to bring your creative vision to life.

## Key Features

- **AI-Powered Scene Generation**: Leverage Google's Gemini model via Genkit to generate creative and coherent script scenes from simple descriptions.
- **Dual-Language Output**: Get your script in your selected language plus an English version optimized for AI video generation tools.
- **Iterative Editing**: Refine your story with powerful tools. Regenerate individual scenes with feedback, copy scenes to your clipboard, or delete them to perfect your narrative.
- **Instant Scene Visualization**: Generate a stunning visual concept for any scene with a single click, bringing your description to life.
- **Fully-Featured Admin Dashboard**: A secure, behind-the-scenes control panel to manage all aspects of the site's content and appearance.
- **Dynamic On-Page Editing**: Modify homepage features, FAQ sections, and generator options directly from the admin dashboard.
- **Easy Export**: Export your generated scripts in JSON or formatted TXT files.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **AI Integration**: [Google Gemini](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Deployment**: [Vercel](https://vercel.com/) / [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or a compatible package manager

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/SceneForgeAI.git
    cd SceneForgeAI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    - Create a new file named `.env` in the root of your project.
    - Add the following lines to the `.env` file, choosing a secure password for the admin dashboard:
      ```env
      ADMIN_PASSWORD=your_super_secret_password
      ```
    - **Important**: To use the AI features, you need a Google AI API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey). Add it to your `.env` file:
      ```env
      GOOGLE_API_KEY=your_google_ai_api_key_here
      ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

---

## Admin Dashboard

The application includes a comprehensive admin dashboard for managing site content and viewing analytics.

-   **Access**: Navigate to `/admin`.
-   **Login**: Use the `ADMIN_PASSWORD` you set in your `.env` file.
-   **Features**: From the dashboard, you can edit the Features, "How To Use" steps, Showcase Examples, FAQ, Form Options, Prompt Template, and global Site Settings. You can also view user and generation analytics.

## Deployment

The easiest way to deploy this Next.js application is with [Vercel](https://vercel.com/).

1.  Push your code to a GitHub repository.
2.  Import the repository into Vercel.
3.  Vercel will automatically detect that this is a Next.js project and configure the build settings.
4.  During the import process, you will be prompted to add Environment Variables. Be sure to add `ADMIN_PASSWORD` and `GOOGLE_API_KEY` with the same values from your `.env` file.
5.  Click **Deploy**, and you're live!

## License

This project is licensed under the terms specified in the `LICENSE` file. Please review it before use.
