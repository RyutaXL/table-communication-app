# Table Communication App - GCP Deployment Guide

## 📋 Prerequisites

1. **Google Cloud Platform Account**
   - GCPプロジェクト作成済み
   - 課金有効化済み

2. **Required GCP APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **GitHub Repository**
   - コードがGitHubにプッシュされている

## 🚀 Quick Deployment

### Step 1: Clone and Setup
```bash
git clone <your-github-repo>
cd table-app
```

### Step 2: Set Project ID
```bash
export PROJECT_ID="your-gcp-project-id"
```

### Step 3: Deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📝 Manual Deployment Steps

### 1. Enable Required APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Set Default Project
```bash
gcloud config set project YOUR_PROJECT_ID
```

### 3. Build and Deploy
```bash
gcloud builds submit --config cloudbuild.yaml
```

## 🔗 GitHub Integration Setup

### Option 1: Cloud Build GitHub App (Recommended)
1. GCP Console → Cloud Build → トリガー
2. 「トリガーを作成」
3. 名前: `github-deploy`
4. イベント: `プッシュ`
5. ソース: `GitHub`
6. リポジトリ: あなたのGitHubリポジトリを選択
7. ブランチ: `main`
8. 設定ファイル: `cloudbuild.yaml`

### Option 2: GitHub Actions
`.github/workflows/deploy.yml` を作成:
```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Google Cloud
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}

      - name: Build and Deploy
        run: gcloud builds submit --config cloudbuild.yaml
```

## ⚙️ Configuration

### Environment Variables
本番環境での環境変数は `cloudbuild.yaml` で設定可能:
```yaml
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - 'table-communication-app'
    - '--set-env-vars'
    - 'NODE_ENV=production'
    - '--image'
    - 'gcr.io/$PROJECT_ID/table-communication-app:$COMMIT_SHA'
    # ... other args
```

### Custom Domain
```bash
gcloud run domain-mappings create \
  --service table-communication-app \
  --domain your-domain.com \
  --region asia-northeast1
```

## 📊 Monitoring & Logs

### View Logs
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=table-communication-app" --limit 50
```

### Cloud Monitoring
- GCP Console → Cloud Run → サービスを選択
- 「メトリクス」タブでパフォーマンス監視

## 🔧 Troubleshooting

### Build Errors
```bash
gcloud builds list --filter "status=FAILURE" --limit 5
gcloud builds log $(gcloud builds list --filter "status=FAILURE" --limit 1 --format "value(id)")
```

### Deployment Issues
```bash
gcloud run services describe table-communication-app --region asia-northeast1
```

### Common Issues
1. **API not enabled**: `gcloud services enable [API_NAME]`
2. **Permissions**: Cloud Buildサービスアカウントに適切な権限を付与
3. **Region mismatch**: リージョンを統一（asia-northeast1推奨）

## 💰 Cost Estimation

- **Cloud Run**: リクエストベース（無料枠: 月200万リクエスト）
- **Cloud Build**: ビルド時間ベース（無料枠: 月120分）
- **Container Registry**: ストレージベース（無料枠: 5GB）

## 🎯 Performance Tips

1. **Cold Starts対策**: `--min-instances 1`（有料）
2. **Memory最適化**: 必要に応じて `--memory` 調整
3. **CPU最適化**: CPU intensiveなら `--cpu 2`

## 🔐 Security

- 不要なポートは公開しない
- 環境変数でシークレット管理
- Cloud ArmorでWAF設定（必要に応じて）

---

## 📞 Support

問題が発生したら:
1. Cloud Buildのログを確認
2. GCP ConsoleのCloud Runサービスを確認
3. このドキュメントのTroubleshootingセクションを参照
