export type TaskStatus = 'todo' | 'in_progress' | 'completed'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  user_id: string
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  status: TaskStatus
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
}

export type ColumnType = {
  id: TaskStatus
  title: string
  color: string
}
