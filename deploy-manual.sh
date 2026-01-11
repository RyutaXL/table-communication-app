#!/bin/bash

# Manual deployment script for Table Communication App
# Use this if Cloud Build has permission issues

set -e

# Configuration
PROJECT_ID="table-484004"
REGION="asia-northeast1"
SERVICE_NAME="table-communication-app"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🔧 Manual deployment to GCP..."
echo "📍 Project ID: $PROJECT_ID"
echo "📍 Region: $REGION"
echo "📍 Service: $SERVICE_NAME"
echo ""

# Check authentication
echo "🔐 Checking authentication..."
gcloud config set project $PROJECT_ID

# Build Docker image locally
echo "🏗️ Building Docker image locally..."
docker build -t $IMAGE_NAME .

# Push to Container Registry
echo "📤 Pushing to Container Registry..."
gcloud auth configure-docker --quiet
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5 \
  --timeout 300 \
  --concurrency 80 \
  --set-env-vars "NODE_ENV=production"

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format "value(status.url)")

echo ""
echo "✅ Deployment completed!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "📝 Note: Don't forget to set GOOGLE_AI_API_KEY environment variable:"
echo "   gcloud run services update $SERVICE_NAME --set-env-vars GOOGLE_AI_API_KEY=your_key_here --region $REGION"
