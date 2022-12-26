import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('authentication')
const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJIXSp6/KnpN/CMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1yMmR3bXlyeGFmY3gwc3dhLnVzLmF1dGgwLmNvbTAeFw0yMjEyMjEx
NTIxMjFaFw0zNjA4MjkxNTIxMjFaMCwxKjAoBgNVBAMTIWRldi1yMmR3bXlyeGFm
Y3gwc3dhLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAKKFe6hak4kPxor7DrPYX8Pr1i4kO5p7Om+3wDX7GJidKB9P/1s9YH6/K6Tj
tVEHSFEciWRIAmXQXAOU2A/QDrmAYTII8HmSIarPRmhCWuZvBNjRVGsmbq0EO3Cl
T2cDrR0JV3Tl0aLFMD5Bvgt2eSblJQhAyiooeabiw+U2DQY004qBbXNyPsFhZJkF
jnScqFS8fgVsuXjh2x+wmOerP257u8x/odDzgRb3/oBS4wBj8knk66zE/DHd+JJW
1xAFW8NmwzyGsvQQRxQAwUjm7g868jLzSUxSNBm6KfdTCoxUj7H2W1shEe+IDp05
X8k9O9axhKWbvfkMoOZiH4sVCasCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUeSKgZOaCx2rbFo74NCaiFYk9cHwwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQACc0vAsc6xGWcrKYL6QpQS7kkoU3+8YH42t7iL0W79
pcQjPUa0nGKM3yzb+skj3datPT/ZaCbASrDgN0DWqqZJlUCrNuYwBjUOFz8ilKSJ
hbewHn1wJSvK5zM3PxmftbhLKWVg7vYjRZnNjfrNvE1SqZDYw/5VjURj9jIBHIny
TrfFRTfDL2NnUcr02SI8N1a0Qo93aRGrvv8UqwX/ueCHagKd5DurQ5L9AMc1mtM0
9/8o+oXfsB23MrpFqOoUB/3515JYk9x7V6brlMzmUOlrXBdFl8Z860iq3Q5Um2mk
rong0fQHIPz4Oho4aR2XS5TycfeeX1FIWzJVBq3WwYv/
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorize user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User is authorized', jwtToken)
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User is not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  if (!authHeader)
    throw new Error('No authentication header')
  return verify(token, cert, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')
  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')
  const split = authHeader.split(' ')
  const token = split[1]
  return token
}
