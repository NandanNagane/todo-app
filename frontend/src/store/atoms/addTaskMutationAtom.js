import { atomWithMutation } from 'jotai-tanstack-query'
import { createTask } from '@/api/task'

const addTaskMutationAtom = atomWithMutation(() => ({
  mutationKey: ['addTask'],
  mutationFn: createTask,
}))

export default addTaskMutationAtom
