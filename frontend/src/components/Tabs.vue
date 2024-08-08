<template>
  <div class="tabs mt-3">
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <router-link class="nav-link" :class="{ active: isActive('ProjectList') }" :to="{ name: 'ProjectList' }">
          Projects
        </router-link>
      </li>
      <li class="nav-item">
        <router-link
          class="nav-link"
          :class="{ active: isActive('TaskList') }"
          :to="{ name: 'TaskList', params: { projectId: projectId } }"
        >
          Tasks
        </router-link>
      </li>
      <li class="nav-item">
        <router-link
          class="nav-link"
          :class="{ active: isActive('OverdueReport') }"
          :to="{ name: 'OverdueReport', params: { projectId: projectId } }"
        >
          Reports
        </router-link>
      </li>
      <li class="nav-item">
        <router-link
          class="nav-link"
          :class="{ active: isActive('KanbanBoard') }"
          :to="{ name: 'KanbanBoard', params: { projectId: projectId } }"
        >
          Kanban Board
        </router-link>
      </li>
      <li class="nav-item">
        <router-link
          class="nav-link"
          :class="{ active: isActive('EditProject') }"
          :to="{ name: 'EditProject', params: { projectId: projectId } }"
        >
          Settings
        </router-link>
      </li>
      <li class="nav-item">
        <router-link
          class="nav-link"
          :class="{ active: isActive('InviteUser') }"
          :to="{ name: 'InviteUser', params: { projectId: projectId } }"
        >
          Invite Users
        </router-link>
      </li>
    </ul>
    <div class="tab-content mt-3">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const projectId = route.params.projectId.toString()

const isActive = (name: string) => route.name === name
</script>
