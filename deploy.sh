#!/bin/bash

# Table Communication App - GCP Deployment Script
# Usage: ./deploy.sh

set -e

# Configuration
PROJECT_ID="${PROJECT_ID:-table-484004}"
REGION="asia-northeast1"
SERVICE_NAME="table-communication-app"

echo "🚀 Starting deployment to GCP..."

# Build and push Docker image
echo "📦 Building and pushing Docker image..."
gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID

# Get the service URL
echo "🔗 Getting service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project $PROJECT_ID --format "value(status.url)")

echo "✅ Deployment completed!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "📱 Mobile-friendly URL: $SERVICE_URL"
echo ""
echo "🔧 To update the service:"
echo "   gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID"
echo ""
echo "📊 To check logs:"
echo "   gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit 50 --project $PROJECT_ID"
