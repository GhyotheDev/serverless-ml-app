import json
import boto3
import base64
import os

# Initialize AWS clients
rekognition = boto3.client('rekognition')
s3 = boto3.client('s3')

def lambda_handler(event, context):
    """
    Lambda function to analyze images using AWS Rekognition.
    Triggered by S3 upload or direct image data via API Gateway.
    """
    try:
        # Check if the event is from S3
        if 'Records' in event and event['Records'][0]['eventSource'] == 'aws:s3':
            bucket = event['Records'][0]['s3']['bucket']['name']
            key = event['Records'][0]['s3']['object']['key']
            
            # Get image from S3
            response = rekognition.detect_labels(
                Image={
                    'S3Object': {
                        'Bucket': bucket,
                        'Name': key
                    }
                },
                MaxLabels=10,
                MinConfidence=70
            )
            
            # Get face details if any
            face_response = rekognition.detect_faces(
                Image={
                    'S3Object': {
                        'Bucket': bucket,
                        'Name': key
                    }
                },
                Attributes=['ALL']
            )
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'labels': response['Labels'],
                    'faces': face_response['FaceDetails'],
                    'image_url': f"https://{bucket}.s3.amazonaws.com/{key}"
                })
            }
        
        # If event is from API Gateway with base64 encoded image
        elif 'body' in event:
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
            
            if 'image' in body:
                image_bytes = base64.b64decode(body['image'])
                
                # Analyze image with Rekognition
                response = rekognition.detect_labels(
                    Image={'Bytes': image_bytes},
                    MaxLabels=10,
                    MinConfidence=70
                )
                
                face_response = rekognition.detect_faces(
                    Image={'Bytes': image_bytes},
                    Attributes=['ALL']
                )
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'labels': response['Labels'],
                        'faces': face_response['FaceDetails']
                    })
                }
        
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid request format'})
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }