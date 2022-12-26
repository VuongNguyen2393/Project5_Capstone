import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateTodo } from '../../helpers/todos'
import { getTodo } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger';

const logger = createLogger('Update Todo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = await getUserId(event)

    const item = await getTodo(userId, todoId)
    if(!item){
      logger.error(`Update denied`)
      return {
        statusCode: 404,
        body: 'Id does not exist'
      }
    }
    const items = await updateTodo(updatedTodo, userId, todoId)
 
 return{
    statusCode: 200,
    body: JSON.stringify(items)
  }
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
