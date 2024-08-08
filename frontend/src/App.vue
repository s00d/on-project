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
</style>
