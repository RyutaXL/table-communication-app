#!/bin/bash

# Table Communication App - Quick GCP Deployment Script
# Usage: ./deploy.sh

set -e

# Configuration
PROJECT_ID="table-484004"
REGION="asia-northeast1"
SERVICE_NAME="table-communication-app"

echo "🚀 Starting quick deployment to GCP..."
echo "📍 Project ID: $PROJECT_ID"
echo "📍 Region: $REGION"
echo "📍 Service: $SERVICE_NAME"
echo ""

# Check if gcloud is authenticated
echo "🔐 Checking gcloud authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 > /dev/null; then
    echo "❌ Not authenticated with gcloud. Please run:"
    echo "   gcloud auth login"
    echo "   gcloud config set project $PROJECT_ID"
    exit 1
fi

# Set project
echo "🔧 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# Build and deploy
echo "📦 Building and deploying..."
gcloud builds submit --config cloudbuild.yaml --quiet

# Get the service URL
echo "🔗 Getting service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format "value(status.url)")

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Service URL: $SERVICE_URL"
echo "📱 Mobile-friendly URL: $SERVICE_URL"
echo ""
echo "🎉 Ready for restaurant staff to use!"
echo ""
echo "📊 To check service status:"
echo "   gcloud run services describe $SERVICE_NAME --region $REGION"
echo ""
echo "📝 To view logs:"
echo "   gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit 10"
