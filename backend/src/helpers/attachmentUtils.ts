import * as AWS from 'aws-sdk'
import { String } from 'aws-sdk/clients/cloudsearch';
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const urlExiration = process.env.SIGNED_URL_EXPIRATION
const S3 = new XAWS.S3({ signatureVersion: 'v4' })
const bucket = process.env.ATTACHMENT_S3_BUCKET

export async function createUploadPresignedUrl(todoId:string): Promise<String>{
   
    const url = S3.getSignedUrl("putObject", {
        Bucket: bucket,
        Key: todoId,
        Expires: parseInt(urlExiration)
    });
    return url;
    }