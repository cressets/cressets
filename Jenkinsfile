pipeline {
    agent any

    tools {
        nodejs "nodejs-22.17.1"
    }

    environment {
        APP_NAME = "cressets"
        APP_DIR  = "/var/www/cressets"
        PORT     = "3000"
    }

    stages {

        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/cressets/cressets.git',
                    credentialsId: 'GITHUB'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                npm install
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                npm run build
                '''
            }
        }

        stage('Deploy Files') {
            steps {
                sh '''
                mkdir -p $APP_DIR

                rsync -av --delete \
                  .next \
                  public \
                  package.json \
                  node_modules \
                  next.config.js \
                  $APP_DIR/
                '''
            }
        }

        stage('Run with PM2') {
            steps {
                sh '''
                cd $APP_DIR

                pm2 delete $APP_NAME || true

                pm2 start npm \
                  --name "$APP_NAME" \
                  -- start -- -p $PORT

                pm2 save
                '''
            }
        }
    }

    post {
        success {
            echo "🚀 배포 완료"
        }
        failure {
            echo "❌ 배포 실패"
        }
    }
}
