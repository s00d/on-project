<template>
  <div id="app">
    <HeaderComponent />
    <Alert />
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HeaderComponent from './components/HeaderComponent.vue'
import Alert from './components/Alert.vue'

export default defineComponent({
  name: 'App',
  components: {
    HeaderComponent,
    Alert
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding-bottom: 100px;
}

.circle {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.markdown-content {
  overflow: scroll;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: bold;
  color: #2c3e50;
}

.markdown-content h1 {
  font-size: 2.5rem;
  border-bottom: 2px solid #e74c3c;
  padding-bottom: 0.5rem;
}

.markdown-content h2 {
  font-size: 2rem;
  border-bottom: 1px solid #e74c3c;
  padding-bottom: 0.5rem;
}

.markdown-content h3 {
  font-size: 1.75rem;
}

.markdown-content h4 {
  font-size: 1.5rem;
}

.markdown-content h5 {
  font-size: 1.25rem;
}

.markdown-content h6 {
  font-size: 1rem;
  color: #7f8c8d;
}

.markdown-content p {
  margin: 0;
}

.markdown-content a {
  color: #3498db;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content ul,
.markdown-content ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.markdown-content ul li,
.markdown-content ol li {
  margin-bottom: 0.5rem;
}

.markdown-content blockquote {
  margin: 1.5rem 0;
  padding: 0.75rem 1.5rem;
  background-color: #f5f5f5;
  border-left: 5px solid #e74c3c;
  color: #555;
  font-style: italic;
}

.markdown-content code {
  font-family: 'Courier New', Courier, monospace;
  background-color: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
}

.markdown-content pre {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  overflow-x: auto;
  border-radius: 5px;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
  border-radius: 5px;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  border: 1px solid #ddd;
}

.markdown-content table th,
.markdown-content table td {
  padding: 0.1rem;
  border: 1px solid #ddd;
  text-align: left;
}

.markdown-content table th {
  background-color: #f7f7f7;
  font-weight: bold;
}

.markdown-content hr {
  border: 0;
  border-top: 1px solid #eee;
  margin: 2rem 0;
}

.overflow-hidden {
  overflow: hidden;
}

.project-board {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
  background-color: #f4f5f7;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.board-title {
  font-size: 2rem;
  font-weight: bold;
}

.board-columns {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: flex-start;
}

.board-column {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  width: calc(25% - 16px);
  padding: 16px;
  cursor: pointer;
}

.board-column:hover {
  transform: translateY(-5px);
  background-color: #e2e8f0;
}


.board-column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.board-column-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px; /* Ограничиваем ширину, чтобы текст обрезался */
}

.board-column-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}


.add-column {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #edf2f7;
  border-radius: 8px;
  border: 2px dashed #cbd5e0;
  cursor: pointer;
  min-height: 158px;
}
</style>
