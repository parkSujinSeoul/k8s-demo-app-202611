// k8s-demo-app CI 파이프라인 (Jenkins on bastion-02)
// 흐름: 소스 checkout → 이미지 빌드 → Docker Hub push → manifest-repo 이미지 태그 갱신 → (ArgoCD가 자동 Sync)
//
// Jenkins에 미리 등록할 Credentials
//   - dockerhub-cred : Docker Hub 아이디 / Access Token  (Username with password)
//   - github-cred    : GitHub 아이디 / Personal Access Token (Username with password)

pipeline {
  agent any

  environment {
    DOCKERHUB_USER = 'YOUR_DOCKERHUB_ID'          // TODO: 본인 Docker Hub 아이디로 변경
    IMAGE          = "docker.io/${DOCKERHUB_USER}/k8s-demo-app"
    MANIFEST_REPO  = 'github.com/parkSujinSeoul/k8s-demo-manifests-202611.git'
    MANIFEST_FILE  = 'deployment.yaml'
  }

  // GitHub에서 bastion(사설 IP)으로 webhook이 닿지 않으므로 1분마다 변경 여부를 확인한다.
  triggers {
    pollSCM('* * * * *')
  }

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  stages {
    stage('Set Tag') {
      steps {
        script {
          env.GIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.TAG = "${env.BUILD_NUMBER}-${env.GIT_SHORT}"
        }
        echo "IMAGE=${IMAGE}:${TAG}"
      }
    }

    stage('Build') {
      steps {
        sh 'docker build --build-arg BUILD_TAG=$TAG -t $IMAGE:$TAG .'
      }
    }

    stage('Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                                          usernameVariable: 'DH_USER', passwordVariable: 'DH_TOKEN')]) {
          sh '''
            echo "$DH_TOKEN" | docker login -u "$DH_USER" --password-stdin
            docker push $IMAGE:$TAG
            docker logout
          '''
        }
      }
    }

    stage('Update Manifest') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'github-cred',
                                          usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
          sh '''
            rm -rf manifests
            git clone https://$GH_USER:$GH_TOKEN@$MANIFEST_REPO manifests
            cd manifests
            sed -i -E "s#^( *)image: .*/k8s-demo-app:.*#\\\\1image: $IMAGE:$TAG#" $MANIFEST_FILE
            git diff --stat
            git config user.name  "jenkins"
            git config user.email "jenkins@bastion-02"
            git commit -am "deploy: k8s-demo-app $TAG"
            git push origin main
          '''
        }
      }
    }
  }

  post {
    always {
      // bastion 디스크(여유 37GB) 보호: 이번 빌드 이미지는 push 후 로컬에서 삭제
      sh 'docker rmi $IMAGE:$TAG || true'
      sh 'rm -rf manifests'
    }
    success {
      echo "배포 요청 완료: ${IMAGE}:${TAG} → ArgoCD가 manifest 변경을 감지해 자동 배포"
    }
  }
}
