def CONTAINER_NAME="kaleidos-frontend"
def CONTAINER_TAG="latest"
def HTTP_PORT="8081"

node {

  currentBuild.result = 'SUCCESS'
  boolean skipBuild = false

  stage('Initialize'){
    def dockerHome = tool 'myDocker'
    def mavenHome  = tool 'myMaven'
    env.PATH = "${dockerHome}/bin:${mavenHome}/bin:${env.PATH}"
  }

  stage('Checkout') {
    checkout scm
  }

  try {

    stage('Build'){
      sh "ember build --environment=production"
    }

    stage("Image Prune"){
      imagePrune(CONTAINER_NAME)
    }

    stage('Image Build'){
      imageBuild(CONTAINER_NAME, CONTAINER_TAG)
    }

    stage('Run App'){
      runApp(CONTAINER_NAME, CONTAINER_TAG, DOCKER_HUB_USER, HTTP_PORT)
    }
  } catch (err) {
    currentBuild.result = 'FAILED'
    throw err
  }

}

def imagePrune(containerName){
    try {
        sh "docker image prune -f"
        sh "docker stop $containerName"
    } catch(error){}
}

def imageBuild(containerName, tag){
    sh "docker build -t $containerName:$tag  -t $containerName --no-cache ."
    echo "Image build complete"
}

def runApp(containerName, tag, dockerHubUser, httpPort){
    sh "docker run -d --rm -p $httpPort:$httpPort --name $containerName $dockerHubUser/$containerName:$tag"
    echo "Application started on port: ${httpPort} (http)"
}

