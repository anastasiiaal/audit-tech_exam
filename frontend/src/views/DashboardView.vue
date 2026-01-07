<template>
  <div class="dashboard-view">
    <h1>Dashboard</h1>

    <div v-if="loading" class="loading">Chargement des statistiques...</div>

    <div v-else class="dashboard-grid">
      <!-- Stats cards -->
      <div class="card stat-card">
        <div class="stat-icon" style="background: #3498db;">📋</div>
        <div class="stat-content">
          <h3>{{ summary.tasksByStatus?.total || 0 }}</h3>
          <p>Total des tâches</p>
        </div>
      </div>

      <div class="card stat-card">
        <div class="stat-icon" style="background: #f39c12;">⏳</div>
        <div class="stat-content">
          <h3>{{ summary.tasksByStatus?.todo || 0 }}</h3>
          <p>À faire</p>
        </div>
      </div>

      <div class="card stat-card">
        <div class="stat-icon" style="background: #9b59b6;">🔄</div>
        <div class="stat-content">
          <h3>{{ summary.tasksByStatus?.in_progress || 0 }}</h3>
          <p>En cours</p>
        </div>
      </div>

      <div class="card stat-card">
        <div class="stat-icon" style="background: #2ecc71;">✓</div>
        <div class="stat-content">
          <h3>{{ summary.tasksByStatus?.done || 0 }}</h3>
          <p>Terminées</p>
        </div>
      </div>

      <!-- Temps total -->
      <div class="card time-card">
        <h3>Temps total enregistré</h3>
        <div class="time-display">
          {{ formatTime(summary.totalTimeLogged || 0) }}
        </div>
      </div>

      <!-- Graphique simple -->
      <div class="card chart-card">
        <h3>Répartition des tâches</h3>
        <div class="simple-chart">
          <div class="chart-bar" :style="{ width: getPercentage('todo') + '%', background: '#f39c12' }"
            :title="`À faire: ${summary.tasksByStatus?.todo || 0}`">
            <span v-if="getPercentage('todo') > 10">{{ summary.tasksByStatus?.todo || 0 }}</span>
          </div>
          <div class="chart-bar" :style="{ width: getPercentage('in_progress') + '%', background: '#9b59b6' }"
            :title="`En cours: ${summary.tasksByStatus?.in_progress || 0}`">
            <span v-if="getPercentage('in_progress') > 10">{{ summary.tasksByStatus?.in_progress || 0 }}</span>
          </div>
          <div class="chart-bar" :style="{ width: getPercentage('done') + '%', background: '#2ecc71' }"
            :title="`Terminées: ${summary.tasksByStatus?.done || 0}`">
            <span v-if="getPercentage('done') > 10">{{ summary.tasksByStatus?.done || 0 }}</span>
          </div>
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color" style="background: #f39c12;"></span>
            À faire
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #9b59b6;"></span>
            En cours
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #2ecc71;"></span>
            Terminées
          </div>
        </div>
      </div>

      <!-- Tâches récentes -->
      <div class="card recent-tasks-card">
        <h3>Tâches récentes</h3>
        <div v-if="summary.recentTasks?.length === 0" class="empty-state">
          Aucune tâche récente
        </div>
        <ul v-else class="recent-tasks-list">
          <li v-for="task in summary.recentTasks" :key="task.id" class="recent-task-item">
            <div class="task-name">{{ task.name }}</div>
            <div class="task-meta">
              <span class="task-status" :class="'status-' + task.status">
                {{ getStatusLabel(task.status) }}
              </span>
              <span class="task-time">{{ formatTime(task.time_logged) }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import api from '../api'

interface Summary {
  tasksByStatus?: {
    todo: number
    in_progress: number
    done: number
    total: number
  }
  totalTimeLogged?: number
  recentTasks?: Array<{
    id: number
    name: string
    status: string
    time_logged: number
    created_at: string
  }>
}

const summary = ref<Summary>({})
const loading = ref(false)

watch(summary, () => {
  // Recalcul inutile à chaque changement
  const _ = JSON.parse(JSON.stringify(summary.value))
}, { deep: true })

const loadSummary = async () => {
  try {
    loading.value = true
    const response = await api.get('/dashboard/summary')
    summary.value = response.data
  } catch (error) {
    console.error('Error loading summary:', error)
  } finally {
    loading.value = false
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

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    todo: 'À faire',
    in_progress: 'En cours',
    done: 'Terminée'
  }
  return labels[status] || status
}

const getPercentage = (status: 'todo' | 'in_progress' | 'done'): number => {
  const total = summary.value.tasksByStatus?.total || 0
  if (total === 0) return 0

  const count = summary.value.tasksByStatus?.[status] || 0
  return (count / total) * 100
}

onMounted(() => {
  loadSummary()
})
</script>

<style scoped>
.dashboard-view {
  padding: 1rem 0;
}

.dashboard-view h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.stat-content h3 {
  font-size: 2rem;
  margin: 0;
  color: #2c3e50;
}

.stat-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.time-card {
  grid-column: span 2;
  text-align: center;
}

.time-display {
  font-size: 3rem;
  font-weight: bold;
  color: #3498db;
  margin-top: 1rem;
}

.chart-card {
  grid-column: span 2;
}

.simple-chart {
  display: flex;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem 0;
}

.chart-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  transition: all 0.3s;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.recent-tasks-card {
  grid-column: span 2;
}

.recent-tasks-list {
  list-style: none;
  margin-top: 1rem;
}

.recent-task-item {
  padding: 1rem;
  border-bottom: 1px solid #ecf0f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-task-item:last-child {
  border-bottom: none;
}

.task-name {
  font-weight: 500;
  color: #2c3e50;
}

.task-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.task-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
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

.task-time {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}
</style>
