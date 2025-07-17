```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │     │               │
│  Web Browser  │────▶│  API Gateway  │────▶│  AWS Lambda   │────▶│ AWS Rekognition│
│   (Frontend)  │     │  (REST API)   │     │  (Function)   │     │  (ML Service) │
│               │     │               │     │               │     │               │
└───────┬───────┘     └───────────────┘     └───────┬───────┘     └───────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌───────────────┐                           ┌───────────────┐
│               │                           │               │
│   Amazon S3   │◀─────────────────────────▶│ Amazon S3     │
│  (Web Host)   │                           │ (Image Store) │
│               │                           │               │
└───────────────┘                           └───────────────┘
```

# Architecture Diagram Description

This diagram illustrates the serverless architecture of the image recognition application:

1. **Web Browser (Frontend)**: Users interact with the application through a web interface hosted on S3
2. **API Gateway**: Provides RESTful API endpoints for the frontend to communicate with the backend
3. **AWS Lambda**: Processes image analysis requests and communicates with AWS Rekognition
4. **AWS Rekognition**: Performs machine learning-based image analysis and face detection
5. **Amazon S3 (Image Store)**: Stores uploaded images for processing
6. **Amazon S3 (Web Host)**: Hosts the static frontend website files

The application flow:
- Users upload images through the web interface
- Images are stored in S3 and/or sent directly to the Lambda function via API Gateway
- Lambda processes the images using AWS Rekognition
- Results are returned to the frontend for display

This serverless architecture ensures scalability, cost-efficiency, and minimal maintenance overhead.