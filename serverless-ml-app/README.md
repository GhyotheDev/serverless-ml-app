# Serverless Machine Learning Application

A serverless machine learning application for image recognition using AWS Lambda and AWS Rekognition. This project demonstrates how to build a scalable, serverless application that leverages AWS's machine learning services.

## Features

- Upload images via a web interface
- Analyze images for objects, scenes, and concepts
- Detect and analyze faces in images
- Serverless architecture using AWS Lambda, S3, and API Gateway
- Responsive web interface

## Architecture

![Architecture Diagram](docs/architecture.png)

The application uses the following AWS services:
- **Amazon S3**: Stores uploaded images
- **AWS Lambda**: Processes images and calls AWS Rekognition
- **Amazon API Gateway**: Provides RESTful API endpoints
- **AWS Rekognition**: Performs image analysis and face detection
- **AWS SAM**: Defines and deploys the serverless infrastructure

## Prerequisites

- AWS Account
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed
- Python 3.9 or later

## Deployment Instructions

1. Clone this repository:
   ```
   git clone <your-repo-url>
   cd serverless-ml-app
   ```

2. Deploy the application using AWS SAM:
   ```
   sam build
   sam deploy --guided
   ```

3. During the guided deployment, you'll be asked for:
   - Stack Name: (e.g., serverless-ml-app)
   - AWS Region: (e.g., us-east-1)
   - Confirm changes before deployment: (Y/n)
   - Allow SAM CLI IAM role creation: (Y/n)
   - Save arguments to samconfig.toml: (Y/n)

4. After deployment, SAM will output:
   - The S3 bucket name for image uploads
   - The API Gateway endpoint URL
   - The website URL

5. Update the frontend configuration:
   - Open `frontend/app.js`
   - Update the `API_ENDPOINT` with the API Gateway URL
   - Update the `S3_BUCKET` with the S3 bucket name
   - Update the `REGION` with your AWS region

6. Upload the frontend files to the S3 bucket:
   ```
   aws s3 sync frontend/ s3://YOUR_S3_BUCKET_NAME/ --acl public-read
   ```

7. Enable website hosting for the S3 bucket:
   ```
   aws s3 website s3://YOUR_S3_BUCKET_NAME/ --index-document index.html
   ```

## Usage

1. Open the website URL in your browser
2. Upload an image by dragging and dropping or clicking the upload area
3. Click "Analyze Image" to process the image
4. View the detected objects, scenes, and faces in the results section

## Customization

- Modify the Lambda function to add more Rekognition features
- Customize the frontend UI to match your branding
- Add authentication using Amazon Cognito
- Implement image storage and retrieval features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Portfolio and GitHub

This project demonstrates:
- Serverless architecture design
- Integration with AWS machine learning services
- Frontend and backend development
- Infrastructure as Code (IaC)
- RESTful API design

Feel free to include this project in your portfolio to showcase your cloud and machine learning skills!