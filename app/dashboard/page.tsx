'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, LogOut, Plus, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { TaskColumn } from '@/components/tasks/TaskColumn'
import { TaskModal } from '@/components/tasks/TaskModal'
import { CreateTaskButton } from '@/components/tasks/CreateTaskButton'
import { Button } from '@/components/ui/Button'
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@/types/task'

const columns = [
  { id: 'todo' as TaskStatus, title: 'To Do', color: 'border-slate-500 bg-slate-50' },
  { id: 'in_progress' as TaskStatus, title: 'In Progress', color: 'border-blue-500 bg-blue-50' },
  { id: 'completed' as TaskStatus, title: 'Completed', color: 'border-green-500 bg-green-50' },
]

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const {
    tasks,
    loading: tasksLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTasksByStatus,
  } = useTasks(user?.id)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const handleCreateClick = () => {
    setEditingTask(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditClick = (task: Task) => {
    setEditingTask(task)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleModalSubmit = async (data: CreateTaskInput | UpdateTaskInput) => {
    if (modalMode === 'create') {
      await createTask(data as CreateTaskInput)
    } else if (editingTask) {
      await updateTask(editingTask.id, data as UpdateTaskInput)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId)
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTaskStatus(taskId, status)
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Task Board</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <CreateTaskButton onClick={handleCreateClick} />
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 text-white bg-destructive rounded-md">
            {error}
          </div>
        )}

        {tasksLoading && tasks.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <TaskColumn
                key={column.id}
                title={column.title}
                status={column.id}
                tasks={getTasksByStatus(column.id)}
                onEditTask={handleEditClick}
                onDeleteTask={handleDeleteTask}
                onStatusChange={handleStatusChange}
                color={column.color}
              />
            ))}
          </div>
        )}
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        task={editingTask}
        mode={modalMode}
      />
    </div>
  )
}
