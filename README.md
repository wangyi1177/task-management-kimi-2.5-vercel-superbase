# Task Management Application

A complete, production-ready Task Management Application built with Next.js, Tailwind CSS, and Supabase.

## Folder Structure

```
.
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── AuthForm.tsx
│   │   └── AuthGuard.tsx
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   ├── TaskColumn.tsx
│   │   ├── TaskModal.tsx
│   │   └── CreateTaskButton.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Textarea.tsx
│       ├── Select.tsx
│       └── Card.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useTasks.ts
│   └── useUser.ts
├── lib/
│   ├── supabase.ts
│   ├── database.types.ts
│   └── utils.ts
├── types/
│   └── task.ts
├── supabase/
│   └── schema.sql
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema in `supabase/schema.sql` in the SQL Editor
   - Copy your project URL and anon key to `.env.local`

4. Run the development server:
```bash
npm run dev
```

## Features

- **Authentication**: Secure signup/login with Supabase Auth
- **Dashboard**: Responsive kanban-style board with three columns
- **CRUD Operations**: Full create, read, update, delete task functionality
- **Real-time**: Instant updates across all sessions
- **Responsive**: Mobile-first design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- React Hooks for state management
