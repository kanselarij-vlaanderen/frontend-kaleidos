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

  def branch = 'master'

  stage('Checkout') {
    def scmVars = checkout scm
    def git_branch = scmVars.GIT_BRANCH

    if (git_branch == 'origin/development'){
      branch = 'development'
    }
  }

  try {

    stage("Image Prune"){
      imagePrune(CONTAINER_NAME, branch)
    }

    stage('Image Build'){
      imageBuild(CONTAINER_NAME, CONTAINER_TAG, branch)
    }

    stage('Run App'){
      runApp(CONTAINER_NAME, CONTAINER_TAG, HTTP_PORT, branch)
    }
  } catch (err) {
    currentBuild.result = 'FAILED'
    throw err
  }

}

def imagePrune(containerName, branch){
    try {
        sh "env \$(cat .env.${branch}) docker-compose -f docker-compose.${branch}.yml stop"
        sh "env \$(cat .env.${branch}) docker-compose -f docker-compose.${branch}.yml rm -f"
    } catch(error){
    }
}

def imageBuild(containerName, tag, branch){
    sh "env \$(cat .env.${branch}) docker-compose -f docker-compose.${branch}.yml build"
    echo "Image build complete"
}

def runApp(containerName, tag, httpPort, branch){
    sh "env \$(cat .env.${branch}) docker-compose -f docker-compose.${branch}.yml up -d"
    echo "Application started on port: ${httpPort} (http)"
}
