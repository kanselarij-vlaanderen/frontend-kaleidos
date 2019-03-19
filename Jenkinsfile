def CONTAINER_NAME=""
def CONTAINER_TAG="latest"
def HTTP_PORT="8081"

node {

  env.NODEJS_HOME = "${tool 'node'}"
  env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"
  currentBuild.result = 'SUCCESS'
  boolean skipBuild = false

  stage('Initialize'){
    def dockerHome = tool 'myDocker'
  }

  stage('Checkout') {
    checkout scm
  }

  try {

    stage("Image Prune"){
      imagePrune(CONTAINER_NAME)
    }

    stage('Image Build'){
      imageBuild(CONTAINER_NAME, CONTAINER_TAG)
    }

    stage('Run App'){
      runApp(CONTAINER_NAME, CONTAINER_TAG, HTTP_PORT)
    }
  } catch (err) {
    currentBuild.result = 'FAILED'
    throw err
  }

}

def imagePrune(containerName){
    try {
        sh "docker image prune -f"
        sh "docker-compose stop"
        sh "docker-compose rm -f"
    } catch(error){
    }
}

def imageBuild(containerName, tag){
    sh "docker-compose build"
    echo "Image build complete"
}

def runApp(containerName, tag, httpPort){
    sh "env \$(cat .env.${env.BRANCH_NAME}) docker-compose up -d"
    echo "Application started on port: ${httpPort} (http)"
}

def getGitBranchName() {
    return scm.branches[0].name
}
