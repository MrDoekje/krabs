import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Command, CreateCommandDto } from '@/krabs-sdk/models'
import { useKrabsSdk } from '@/lib/krabs-sdk'
import { th } from 'date-fns/locale'

export const useCommandStore = defineStore('commands', () => {
  const krabsSdk = useKrabsSdk()

  // state
  const commands = ref<Record<string, Command>>({})

  // getters
  const getCommandList = () => computed(() => Object.values(commands.value))
  const getCommand = (commandId: string) => computed(() => commands.value[commandId])

  // actions
  const loadCommand = async (commandId: string) => {
    try {
      const loadedCommand = await krabsSdk.commands.byId(commandId).get()
      if (!loadedCommand?.id) {
        console.error('loaded command does not have id')
        return
      }
      commands.value[loadedCommand.id] = loadedCommand
    } catch {
      console.error('failed to load command')
    }
  }

  const createCommand = async (command: CreateCommandDto): Promise<Command> => {
    try {
      const createdCommand = await krabsSdk.commands.post(command)
      if (createdCommand && createdCommand.id) {
        commands.value[createdCommand.id] = createdCommand
      }

      if (!createdCommand) {
        console.error('created command is undefined')
        throw new Error('Command creation failed')
      }

      return createdCommand
    } catch {
      console.error('could not create command')
      throw new Error('Command creation failed')
    }
  }

  const updateCommand = async (commandId: string, command: CreateCommandDto) => {
    try {
      const updatedCommand = await krabsSdk.commands.byId(commandId).put(command)
      if (updatedCommand && updatedCommand.id) {
        commands.value[updatedCommand.id] = updatedCommand
      }
    } catch {
      console.error('could not update command')
    }
  }

  return {
    commands,
    getCommand,
    getCommandList,
    loadCommand,
    createCommand,
    updateCommand,
  }
})
