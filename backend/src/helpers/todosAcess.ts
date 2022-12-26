import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
const AWSXRay = require('aws-xray-sdk')

const logger = createLogger('TodosAccess')
const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE){ 
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem>  {
        logger.info(`Create todo: ${todoItem}`)
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem,
        }).promise()
        return todoItem
    }

    async getTodoForUser(userId:string, todoId:string):Promise<TodoItem>{
        logger.info(`Get todo: ${todoId}`)
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise()
        return result.Item as TodoItem
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info(`Get all todos: ${userId}`);
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        
        return result.Items as TodoItem[]
    }

    async updateTodo(updatedTodo: any): Promise<TodoItem> {
        logger.info(`Update todo: ${updatedTodo.todoId}`)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: { 
                todoId: updatedTodo.todoId, 
                userId: updatedTodo.userId },
            ExpressionAttributeNames: {"#N": "name"},
            UpdateExpression: "set #N = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":name": updatedTodo.name,
                ":dueDate": updatedTodo.dueDate,
                ":done": updatedTodo.done,
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
        
        return updatedTodo
    }

    async updateAttachmentUrl(userId:string, todoId:string, uploadUrl:string){
        logger.info(`Updating the attachment URL: ${uploadUrl} of todo: ${todoId}`)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: { userId, todoId },
            UpdateExpression: "set attachmentUrl=:attachmentUrl",
            ExpressionAttributeValues: {
            ":attachmentUrl": uploadUrl.split("?")[0]
            }
        }).promise();
    }

    async deleteTodo(userId:string, todoId:string){
        logger.info(`Delete todo: ${todoId}`)
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: { 
                todoId, 
                userId }
        }).promise()
    }
}