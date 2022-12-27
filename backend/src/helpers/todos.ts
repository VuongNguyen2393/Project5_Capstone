import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { createUploadPresignedUrl } from '../helpers/attachmentUtils'

const log = createLogger('businessLogictodos')
const todosAccess = new TodosAccess()

export async function createTodo(createRequest: CreateTodoRequest,userIdVal: string): Promise<TodoItem> {
  return await todosAccess.createTodo({
    todoId: uuid.v4(),
    userId: userIdVal,
    done: false,
    attachmentUrl: '',
    createdAt: new Date().toISOString(),
    name: createRequest.name,
    dueDate: createRequest.dueDate,
    notes: createRequest.notes
  })
}

export async function getTodo(userId: string, todoId: string): Promise<TodoItem> {
  log.info(`get todo: ${todoId}`)
  return await todosAccess.getTodoForUser(userId, todoId)
}

export async function getTodosForUser(userId: string): Promise<any> {
  log.info(`Get all todos of user: ${userId}`)
  return await todosAccess.getAllTodos(userId)
}

export async function updateTodo(updateRequest: UpdateTodoRequest, userId: string, todoId: string): Promise<TodoItem> {
  log.info(`Update todo: ${todoId}`)
  await todosAccess.updateTodo({
    userId,
    todoId,
    name: updateRequest.name,
    dueDate: updateRequest.dueDate,
    done: updateRequest.done,
    notes: updateRequest.notes
  })
  return
}

export async function createAttachmentPresignedUrl(userId: string,todoId: string): Promise<string> {
  log.info(`createAttachmentUrl ${todoId}`)
  const uploadUrl = await createUploadPresignedUrl(todoId)
  await todosAccess.updateAttachmentUrl(userId, todoId, uploadUrl)
  return uploadUrl
}

export async function deleteTodo(userId: string, todoId: string) {
  log.info(`Deleting todo: ${todoId} from user: ${userId}`)
  await todosAccess.deleteTodo(userId, todoId)
}
