<script lang="ts" setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
// Assuming a toast implementation is available, e.g., via a plugin
// import { useToast } from 'vue-toastification'

// const toast = useToast()

const initialArgument = {
  name: 'user_id',
  required: true,
}

const formData = ref({ ...initialArgument })
const isLoading = ref(false)

const handleSubmit = async () => {
  isLoading.value = true

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('Saving argument:', formData.value)
    
    // toast.success('The argument has been updated successfully.')
    alert('Changes saved successfully!')
  } catch (error) {
    // toast.error('Failed to save changes. Please try again.')
    alert('Failed to save changes.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Edit Argument</CardTitle>
        <CardDescription>Update the argument details below</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-y-6">
          <div class="flex gap-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              type="text"
              v-model="formData.name"
              placeholder="Enter argument name"
              required
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex gap-y-0.5">
              <Label for="required">Required</Label>
              <div class="text-sm text-muted-foreground">Mark this argument as required</div>
            </div>
            <Switch
              id="required"
              :checked="formData.required"
              @update:checked="formData.required = $event"
            />
          </div>

          <Button type="submit" class="w-full" :disabled="isLoading || !formData.name.trim()">
            {{ isLoading ? 'Saving...' : 'Save Changes' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>