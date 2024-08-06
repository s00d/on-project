<template>
  <div class="tabs mt-3">
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <router-link class="nav-link" :class="{ active: isActive(`/cabinet`) }" to="/cabinet"
          >Projects</router-link
        >
      </li>
      <li class="nav-item">
        <router-link
          class="nav-link"
          :class="{ active: isActive(`/cabinet/projects/${projectId}`) }"
          :to="`/cabinet/projects/${projectId}`"
          >Tasks</router-link
        >
      </li>
      <li class="nav-item">
        <router-link
          class="nav-link"
          :class="{ active: isActive(`/cabinet/${projectId}/reports`) }"
          :to="`/cabinet/${projectId}/reports`"
          >Reports</router-link
        >
      </li>
      <li class="nav-item">
        <router-link
          class="nav-link"
          :class="{ active: isActive(`/cabinet/${projectId}/kanban`) }"
          :to="`/cabinet/${projectId}/kanban`"
          >Kanban Board</router-link
        >
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

const isActive = (path: string) => route.path.startsWith(path)
</script>
