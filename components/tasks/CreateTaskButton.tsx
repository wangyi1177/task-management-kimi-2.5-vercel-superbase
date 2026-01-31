'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CreateTaskButtonProps {
  onClick: () => void
}

export function CreateTaskButton({ onClick }: CreateTaskButtonProps) {
  return (
    <Button onClick={onClick} className="gap-2">
      <Plus className="h-4 w-4" />
      New Task
    </Button>
  )
}
