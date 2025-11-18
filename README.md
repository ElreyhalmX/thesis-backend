# Culinary Recommendation System

A web-based culinary recommendation system powered by AI and NLP, tailored for Venezuelan university students.

## Features

- Personalized recipe recommendations based on available ingredients
- Venezuelan Spanish NLP ingredient interpreter
- Hybrid AI recommendation engine
- Food waste reduction and ingredient optimization
- Lightweight and device-friendly interface
- Automatic menu planning
- Educational cooking guidance

## Tech Stack

**Frontend:**
- React 19.1
- Vite 7
- TypeScript
- Sass (Module SCSS)
- Jotai (State Management)
- Framer Motion (Animations)
- React Router (Navigation)
- Axios (API Calls)
- Radix UI (Components)
- Vaul (Drawers)
- dayjs (Date handling)

**Backend:**
- Node.js
- Express
- TypeScript
- OpenAI API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- OpenAI API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd culinary-recommendation-system
\`\`\`

2. Install all dependencies:
\`\`\`bash
pnpm install:all
\`\`\`

3. Set up environment variables:

**Backend** (backend/.env):
\`\`\`
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
\`\`\`

**Frontend** (frontend/.env):
\`\`\`
VITE_API_URL=http://localhost:3000/api
\`\`\`

### Running the Application

Run both frontend and backend concurrently:
\`\`\`bash
pnpm dev
\`\`\`

Or run them separately:

**Frontend:**
\`\`\`bash
cd frontend
pnpm dev
\`\`\`

**Backend:**
\`\`\`bash
cd backend
pnpm dev
\`\`\`

The frontend will be available at http://localhost:5173  
The backend API will run on http://localhost:3000

### Building for Production

\`\`\`bash
pnpm build
\`\`\`

## Project Structure

\`\`\`
culinary-recommendation-system/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── config/         # Configuration files (axios, etc.)
│   │   ├── pages/          # Page components
│   │   ├── store/          # Jotai atoms (state management)
│   │   ├── styles/         # SCSS modules and global styles
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (OpenAI integration)
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── package.json            # Root package.json
└── README.md
\`\`\`

## Usage

1. Start on the landing page
2. Enter your available ingredients
3. Select your available cooking time
4. View AI-generated recipe recommendations
5. Click on a recipe to see full details and instructions

## License

MIT
