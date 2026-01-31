# Task Management App - Complete Deployment Guide

**Project Repository:** https://github.com/wangyi1177/task-management-kimi-2.5-vercel-superbase  
**Live Website:** https://task-management-kimi-2.5-vercel-superbase.vercel.app  
**Created:** January 31, 2026

---

## Table of Contents
1. [Account Information](#account-information)
2. [Supabase Setup Guide](#supabase-setup-guide)
3. [Using Supabase in Code](#using-supabase-in-code)
4. [Vercel Deployment Guide](#vercel-deployment-guide)
5. [Troubleshooting](#troubleshooting)

---

## Account Information

### Supabase Account
- **Login Method:** GitHub OAuth
- **Account:** wangyi1177 (GitHub username)
- **Project Name:** (Your project name from Supabase dashboard)
- **Project ID:** nsmcxyyqzurivsnbnbks
- **Region:** Singapore (ap-southeast-1)
- **Project URL:** https://nsmcxyyqzurivsnbnbks.supabase.co

### Vercel Account
- **Login Method:** GitHub OAuth  
- **Account:** wangyi1177 (GitHub username)
- **Team:** Personal (Hobby plan - Free)
- **Project:** task-management-kimi-2.5-vercel-superbase

**Note:** Using GitHub to register on both Supabase and Vercel is the **standard and recommended practice** for developers. It provides:
- Single sign-on convenience
- Automatic repository access for deployments
- Secure authentication without remembering extra passwords
- Easy integration between services

---

## Supabase Setup Guide

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign in with **GitHub** (recommended)
4. Click **"New project"**
5. Choose your organization (usually your GitHub username)
6. Enter project details:
   - **Name:** task-management-app
   - **Database Password:** (Generate strong password)
   - **Region:** Choose closest to your users (Singapore for Asia)
7. Click **"Create new project"**
8. Wait ~2 minutes for project initialization

### Step 2: Get API Credentials
Once project is ready:

1. In your project dashboard, click **"Project Settings"** (gear icon, bottom left)
2. Click **"API"** tab in top navigation
3. Copy these values:
   - **Project URL:** `https://nsmcxyyqzurivsnbnbks.supabase.co`
   - **anon public key:** `eyJhbG...` (long string)
   
   **Important:** Keep these secure! The `anon` key is safe for client-side code.

### Step 3: Setup Database Schema
1. In left sidebar, click **"SQL Editor"**
2. Click **"New query"**
3. Paste this SQL schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'completed')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can only view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at on task updates
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. Click **"Run"** button
5. You should see "Success. No rows returned"

### Step 4: Disable Email Confirmation (Optional - for development)
To avoid "Email not confirmed" errors during testing:

1. In left sidebar, click **"Authentication"**
2. Click **"Providers"** tab
3. Find **"Email"** provider
4. Toggle OFF **"Confirm email"**
5. Click **"Save"**

---

## Using Supabase in Code

### 1. Installation

```bash
npm install @supabase/supabase-js
```

### 2. Client Setup

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### 3. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nsmcxyyqzurivsnbnbks.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-actual-key
```

### 4. Authentication Example

```typescript
import { supabase } from '@/lib/supabase'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### 5. Database Operations (CRUD)

```typescript
import { supabase } from '@/lib/supabase'

// CREATE - Add new task
const { data, error } = await supabase
  .from('tasks')
  .insert({
    title: 'New Task',
    description: 'Task description',
    status: 'todo',
    user_id: user.id
  })
  .select()

// READ - Get all tasks for user
const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

// UPDATE - Update task
const { data, error } = await supabase
  .from('tasks')
  .update({ status: 'completed' })
  .eq('id', taskId)
  .select()

// DELETE - Remove task
const { error } = await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId)
```

### 6. React Hook Example

```typescript
// hooks/useTasks.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useTasks(userId: string) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (!error) setTasks(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (userId) fetchTasks()
  }, [userId])

  return { tasks, loading, fetchTasks }
}
```

---

## Vercel Deployment Guide

### Step 1: Connect GitHub Account
1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your repositories

### Step 2: Import Project
1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your repository: **task-management-kimi-2.5-vercel-superbase**
3. Click **"Import"**
4. Vercel auto-detects Next.js - leave settings as default
5. Click **"Deploy"**

### Step 3: Add Environment Variables
**This is CRITICAL - deployment will fail without these!**

1. In project dashboard, click **"Settings"** tab
2. Click **"Environment Variables"** (left sidebar)
3. Click **"Add"** button for each variable:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://nsmcxyyqzurivsnbnbks.supabase.co`
   - Environment: Production ✓, Preview ✓, Development ✓
   
   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbG...your-anon-key` (paste your actual key)
   - Environment: Production ✓, Preview ✓, Development ✓

4. Click **"Save"** for each

### Step 4: Redeploy
1. Go to **"Deployments"** tab
2. Find the failed deployment
3. Click **three dots** (⋮) → **"Redeploy"**
4. Select **"Use existing Build Cache"** option
5. Wait for build to complete (2-3 minutes)

### Step 5: Verify Deployment
1. Once build succeeds, click the **domain link** (e.g., `task-management-kimi-2.5-vercel-superbase.vercel.app`)
2. Test all features:
   - Sign up new account
   - Login
   - Create task
   - Edit task
   - Delete task
   - Move between columns

---

## Troubleshooting

### Issue: "Email not confirmed" error
**Solution:** 
- Check your email for confirmation link, OR
- Disable email confirmation in Supabase (see Step 4 above)

### Issue: "supabaseUrl is required" error
**Solution:**
- Verify environment variables in Vercel Settings
- Ensure variable names match exactly (case-sensitive)
- Must use `NEXT_PUBLIC_` prefix for client-side access

### Issue: "Vulnerable version of Next.js"
**Solution:**
- Update Next.js to latest stable version in package.json
- Run `npm install next@latest`
- Commit and push changes
- Redeploy on Vercel

### Issue: Build stuck at "Collecting build traces"
**Solution:**
- Cancel the deployment in Vercel dashboard
- Check environment variables are correct
- Redeploy with "Use existing Build Cache" option

### Issue: Database connection errors
**Solution:**
- Verify SQL schema was executed successfully
- Check Row Level Security (RLS) policies are in place
- Ensure user is authenticated before making database calls

---

## Project Architecture

### Tech Stack
- **Framework:** Next.js 15.1.9 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel
- **Icons:** Lucide React

### Folder Structure
```
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── tasks/             # Task management components
│   └── ui/                # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and Supabase client
├── types/                  # TypeScript type definitions
├── supabase/              # SQL schema
└── .env.local             # Environment variables (gitignored)
```

### Key Features
- ✅ GitHub OAuth authentication
- ✅ Email/password signup & login
- ✅ Responsive kanban board (3 columns)
- ✅ Create, read, update, delete tasks
- ✅ Real-time database with Row Level Security
- ✅ TypeScript for type safety
- ✅ Mobile-first responsive design
- ✅ Zero-cost deployment (free tier)

---

## Cost Breakdown (Free Tier)

### Supabase (Free Tier)
- Database: 500 MB
- Auth: 50,000 users/month
- API requests: Unlimited (fair use)
- Storage: 1 GB
- **Cost:** $0/month

### Vercel (Hobby Plan)
- Bandwidth: 100 GB/month
- Build minutes: 6,000 minutes/month
- Serverless Function: 100 GB-hours/month
- **Cost:** $0/month

**Total: $0/month** for personal use and small projects!

---

## Next Steps & Enhancements

### Possible Improvements
1. **Drag & Drop:** Add react-beautiful-dnd for moving tasks between columns
2. **Real-time Updates:** Use Supabase Realtime for live task updates
3. **Due Dates:** Add due date field to tasks
4. **Labels/Tags:** Add color-coded labels to tasks
5. **Search & Filter:** Add task search functionality
6. **Dark Mode:** Add theme toggle
7. **Notifications:** Add browser notifications for due dates
8. **Export:** Add CSV/JSON export functionality

### Production Considerations
1. Enable email confirmation for production
2. Add custom domain (Vercel Pro or custom DNS)
3. Set up monitoring and analytics
4. Add error tracking (Sentry)
5. Implement rate limiting
6. Add data backup strategy

---

## References

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Security Advisory (CVE-2025-66478):** https://nextjs.org/blog/CVE-2025-66478

---

## Notes

**Date Created:** January 31, 2026  
**Author:** wangyi1177  
**Repository:** https://github.com/wangyi1177/task-management-kimi-2.5-vercel-superbase  
**Live URL:** https://task-management-kimi-2.5-vercel-superbase.vercel.app

**Authentication Method:** Both Supabase and Vercel use **GitHub OAuth** for authentication, which is the industry standard for developer tools. This provides seamless integration and eliminates the need to manage separate credentials.

---

*Document created for future reference and team collaboration.*
