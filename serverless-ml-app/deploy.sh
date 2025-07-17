#!/bin/bash

# Exit on error
set -e

echo "Building and deploying the Serverless ML Application..."

# Build the SAM application
echo "Building with SAM..."
sam build

# Deploy the application
echo "Deploying with SAM..."
sam deploy --guided

# Get the outputs from the CloudFormation stack
echo "Getting deployment outputs..."
STACK_NAME=$(aws cloudformation describe-stacks --query "Stacks[?contains(StackName,'serverless-ml-app')].StackName" --output text)

if [ -z "$STACK_NAME" ]; then
    echo "Error: Could not find the deployed stack."
    exit 1
fi

API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ImageAnalysisApi'].OutputValue" --output text)
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ImageBucketName'].OutputValue" --output text)
WEBSITE_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" --output text)
REGION=$(aws configure get region)

echo "Updating frontend configuration..."
# Replace placeholders in the frontend code
sed -i '' "s|YOUR_API_GATEWAY_URL|$API_ENDPOINT|g" frontend/app.js
sed -i '' "s|YOUR_S3_BUCKET_NAME|$S3_BUCKET|g" frontend/app.js
sed -i '' "s|us-east-1|$REGION|g" frontend/app.js

echo "Uploading frontend to S3..."
# Upload the frontend files to S3
aws s3 sync frontend/ s3://$S3_BUCKET/ --acl public-read

echo "Configuring S3 website hosting..."
# Configure S3 bucket for website hosting
aws s3 website s3://$S3_BUCKET/ --index-document index.html

echo "Deployment complete!"
echo "API Endpoint: $API_ENDPOINT"
echo "S3 Bucket: $S3_BUCKET"
echo "Website URL: $WEBSITE_URL"
echo ""
echo "You can now access your application at: $WEBSITE_URL"