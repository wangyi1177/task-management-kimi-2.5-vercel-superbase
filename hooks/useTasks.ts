'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@/types/task'

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTasks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (input: CreateTaskInput) => {
    if (!userId) return { error: new Error('User not authenticated') }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...input,
          user_id: userId,
        })
        .select()
        .single()

      if (error) throw error

      setTasks((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to create task') }
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (taskId: string, input: UpdateTaskInput) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(input)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? data : task))
      )
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to update task') }
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (taskId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to delete task') }
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    return updateTask(taskId, { status })
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTasksByStatus,
  }
}
