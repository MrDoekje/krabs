import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Command, CreateCommandDto, MostPopularFormatDto } from '@/krabs-sdk/models'
import { useKrabsSdk } from '@/lib/krabs-sdk'

export const useCommandStore = defineStore('commands', () => {
  const krabsSdk = useKrabsSdk()

  // state
  const commands = ref<Record<string, Command>>({})
  const mostPopularFormats = ref<MostPopularFormatDto[]>([])

  // getters
  const getCommandList = () => computed(() => Object.values(commands.value))
  const getCommand = (commandId: string) => computed(() => commands.value[commandId])
  const getMostPopularFormats = () => computed(() => mostPopularFormats.value)

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

  const loadAllCommands = async () => {
    try {
      const loadedCommands = await krabsSdk.commands.get()
      if (!loadedCommands?.length) {
        console.error('loaded commands is empty')
        return
      }
      loadedCommands.forEach((cmd) => {
        if (cmd.id) {
          commands.value[cmd.id] = cmd
        }
      })
    } catch {
      console.error('failed to load command')
    }
  }

  const loadMostPopularFormats = async (): Promise<void> => {
    try {
      const formats = await krabsSdk.commands.formats.get()
      if (!Array.isArray(formats) || !formats?.length) {
        console.error('failed to load most popular formats')
        mostPopularFormats.value = []
        return
      }
      for (const format of formats) {
        mostPopularFormats.value.push(format)
      }
    } catch {
      console.error('failed to load most popular formats')
      mostPopularFormats.value = []
      return
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

  const removeCommand = async (commandId: string): Promise<void> => {
    try {
      await krabsSdk.commands.byId(commandId).delete()
      delete commands.value[commandId]
    } catch {
      console.error('could not remove command')
      throw new Error('Command removal failed')
    }
  }

  return {
    commands,
    getCommand,
    getCommandList,
    loadCommand,
    loadAllCommands,
    createCommand,
    updateCommand,
    removeCommand,
    getMostPopularFormats,
    loadMostPopularFormats,
  }
})
