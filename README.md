# AI Integrated Todo — Frontend

A modern Vue 3 + TypeScript SPA for task management with AI-powered assistance. This frontend connects to the Laravel backend API.

## Features

### Task Management
- **Kanban Board**: Drag-and-drop tasks between Todo, In Progress, and Completed columns
- **Task CRUD**: Create, edit, archive, and delete tasks
- **Categories**: Organize tasks with color-coded categories
- **Priorities**: Low, Medium, High priority levels
- **Due Dates**: Set and track task deadlines
- **Archived Tasks**: View and restore archived tasks

### AI Assistant
- **Natural Language Interface**: Chat with AI to manage tasks
- **Task Actions**: Create, update, delete tasks via conversation
- **Smart Suggestions**: Get recommendations on what to focus on
- **Streaming Responses**: Real-time AI responses with SSE

### Authentication & Authorization
- **User Registration & Login**: Secure JWT-based authentication
- **Password Management**: Forgot password and change password flows
- **Role-Based Access**: Admin-only routes for user/category management
- **Token Refresh**: Automatic token refresh on expiration

### Admin Features
- **User Management**: View, ban, and unban users
- **Category Management**: Create, edit, and delete categories

## Tech Stack

- **Vue 3** with Composition API and `<script setup>`
- **TypeScript** for type safety
- **Pinia** for state management
- **Vue Router** with navigation guards
- **Tailwind CSS** for styling
- **Vite** for fast development and builds
- **Zod + VeeValidate** for form validation
- **Axios** for API communication
- **Vitest** for unit testing

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend API URL:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests with Vitest |

## Project Structure

```
src/
├── api/          # Axios instance with interceptors
├── assets/       # Static assets
├── components/   # Reusable Vue components
│   ├── admin/    # Admin-specific components
│   ├── modals/   # Modal dialogs
│   └── tasks/    # Task-related components
├── composables/  # Reusable composition functions
├── router/       # Vue Router configuration
├── stores/       # Pinia stores (auth, tasks, ai)
├── tests/        # Unit tests
├── types/        # TypeScript interfaces
├── validators/   # Zod validation schemas
└── views/        # Page components
```
