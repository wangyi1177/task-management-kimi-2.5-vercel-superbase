'use client'

import { Task, TaskStatus } from '@/types/task'
import { TaskCard } from './TaskCard'
import { cn } from '@/lib/utils'

interface TaskColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
  color: string
}

export function TaskColumn({
  title,
  status,
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  color,
}: TaskColumnProps) {
  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className={cn('flex items-center justify-between p-3 rounded-t-lg border-b-2', color)}>
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="bg-white/20 text-xs font-medium px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 p-3 bg-muted/30 rounded-b-lg border border-t-0 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No tasks</p>
            <p className="text-xs mt-1">Drag tasks here or create new ones</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  )
}
