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

  sh 'scm | sort'
  sh 'pipeline | sort'
  sh 'params | sort'
  sh 'currentBuild | sort'

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

    when {
      branch 'master'  //only run these steps on the master branch
    }
    steps {
        sh "env \$(cat .env.${branch}) docker-compose up -d"
        echo "Application started on port: ${httpPort} (http)"
    }

    when {
      branch 'development'  //only run these steps on the master branch
    }
    steps {
      echo "hello development branch"
    }
}
