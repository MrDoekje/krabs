import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Argument, CreateArgumentDto, UpdateArgumentDto } from '@/krabs-sdk/models'
import { useKrabsSdk } from '@/lib/krabs-sdk'

export const useArgumentStore = defineStore('arguments', () => {
  const krabsSdk = useKrabsSdk()

  // state
  const argumentsMap = ref<Record<number, Argument>>({})

  // getters
  const getArgumentList = () => computed(() => Object.values(argumentsMap.value))
  const getArgument = (argumentId: number) => computed(() => argumentsMap.value[argumentId])

  // actions
  const createArgument = async (argument: CreateArgumentDto): Promise<Argument> => {
    try {
      const createdArgument = await krabsSdk.arguments.post(argument)
      if (createdArgument && typeof createdArgument.id === 'number') {
        argumentsMap.value[createdArgument.id] = createdArgument
      }
      if (!createdArgument) {
        console.error('created argument is undefined')
        throw new Error('Argument creation failed')
      }
      return createdArgument
    } catch (e) {
      console.error('could not create argument', e)
      throw new Error('Argument creation failed')
    }
  }

  const updateArgument = async (argumentId: number, update: UpdateArgumentDto) => {
    try {
      const updatedArgument = await krabsSdk.arguments.byId(argumentId).put(update)
      if (updatedArgument && typeof updatedArgument.id === 'number') {
        argumentsMap.value[updatedArgument.id] = updatedArgument
      }
    } catch (e) {
      console.error('could not update argument', e)
    }
  }

  const removeArgument = async (argumentId: number) => {
    try {
      await krabsSdk.arguments.byId(argumentId).delete()
      delete argumentsMap.value[argumentId]
    } catch (e) {
      console.error('could not remove argument', e)
    }
  }

  return {
    arguments: argumentsMap,
    getArgument,
    getArgumentList,
    createArgument,
    updateArgument,
    removeArgument,
  }
})
