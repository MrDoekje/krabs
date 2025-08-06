<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { createKrabsSDK } from '@/krabs-sdk/krabsSDK'
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary'
import { AnonymousAuthenticationProvider } from '@microsoft/kiota-abstractions'
import { ref } from 'vue'

const authProvider = new AnonymousAuthenticationProvider()
const adapter = new FetchRequestAdapter(authProvider)
adapter.baseUrl = '/api'
const krabsSDK = createKrabsSDK(adapter)

const tasks = ref<any>()

const fetchTasks = async () => {
  try {
    const response = await krabsSDK.tasks.get()
    console.log('Fetched tasks:', response)
    tasks.value = response || []
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }
}
fetchTasks()
</script>

<template>
  <main>
    {{ JSON.stringify(tasks) }}
    <TheWelcome />
  </main>
</template>
