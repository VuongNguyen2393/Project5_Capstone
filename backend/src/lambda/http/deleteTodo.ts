import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo } from '../../helpers/todos'
import { getUserId } from '../utils'
import { getTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger';

const logger = createLogger('deleteTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event: ${event}`)
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const item = await getTodo(userId, todoId)
    if(!item){
      logger.error(`Delete denied`)
      return {
        statusCode: 404,
        body: 'Id does not exist'
      }
    }
    await deleteTodo(userId, todoId)
    return {
      statusCode: 200,
      body: 'Delete sucessfully'
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
