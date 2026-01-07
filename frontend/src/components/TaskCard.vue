<template>
  <div class="task-card card">
    <div class="task-header">
      <h3>{{ task.name }}</h3>
      <select
        :value="task.status"
        @change="updateStatus($event)"
        class="status-select"
        :class="'status-' + task.status"
      >
        <option value="todo">À faire</option>
        <option value="in_progress">En cours</option>
        <option value="done">Terminée</option>
      </select>
    </div>
    
    <p v-if="task.description" class="task-description">{{ task.description }}</p>
    
    <div class="task-meta">
      <div class="time-info">
        <span class="icon">⏱️</span>
        <span>{{ formatTime(task.time_logged) }}</span>
      </div>
      
      <div class="timer-controls">
        <button
          v-if="!task.timer_started_at"
          @click="$emit('start-timer', task.id)"
          class="btn btn-success btn-sm"
        >
          ▶ Démarrer
        </button>
        <button
          v-else
          @click="$emit('stop-timer', task.id)"
          class="btn btn-danger btn-sm"
        >
          ⏸ Arrêter
        </button>
      </div>
    </div>
    
    <div class="task-footer">
      <small>Créée le {{ formatDate(task.created_at) }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import api from '../api'

interface Task {
  id: number
  name: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  time_logged: number
  timer_started_at?: string | null
  created_at: string
  updated_at: string
}

interface Props {
  task: Task
}

const props = defineProps<Props>()
const emit = defineEmits(['update', 'start-timer', 'stop-timer'])

const updateStatus = async (event: Event) => {
  const newStatus = (event.target as HTMLSelectElement).value
  try {
    await api.patch(`/tasks/${props.task.id}/status`, { status: newStatus })
    emit('update')
  } catch (error) {
    console.error('Error updating status:', error)
  }
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
.task-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.task-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  flex: 1;
}

.status-select {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.status-todo {
  background: #fff3cd;
  color: #856404;
}

.status-in_progress {
  background: #e2d1f9;
  color: #6f42c1;
}

.status-done {
  background: #d4edda;
  color: #155724;
}

.task-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid #ecf0f1;
  border-bottom: 1px solid #ecf0f1;
  margin-bottom: 0.5rem;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #7f8c8d;
}

.icon {
  font-size: 1.2rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.task-footer {
  color: #95a5a6;
  font-size: 0.8rem;
}
</style>
