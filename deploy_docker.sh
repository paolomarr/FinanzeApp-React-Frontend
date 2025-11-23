#!/bin/bash

function _stderrecho() {
    echo "$1" >&2
}
function info() {
    _stderrecho "[INFO] $1"
}

function warning() {
    _stderrecho "[WARNING] $1"
}

function error() {
    _stderrecho "[ERROR] $1"
}

 SCRIPT_ROOT=`cd $(dirname $0); pwd`
 FE_ENV_FILE=${SCRIPT_ROOT}/.env
 
#  while [[ $# -gt 0 ]]; do
#      case $1 in
#          --profile)
#              PROFILE=$2
#              shift
#              ;;
#      esac
#      shift
#  done

base_version=`grep "\"version\":" package.json| head -n 1 | sed -E 's/[^0-9\.]//g'`
commit=$(git rev-parse --short HEAD || echo "nvc")
date=$(date '+%Y%m%d%H%M%S')
version_info="$commit-$date"
if [[ -n "$base_version" ]]; then
    version_info=${base_version}-${version_info}
fi
# these exported will filter through the docker compose file
export VERSION_INFO=${version_info}

if [[ ! -f $FE_ENV_FILE ]]; then
    info "Generating .env file for REACT runtime environment variables" >&2
    echo 'VITE_BACKEND_API_BASE="http://localhost:8003/api"' >> $FE_ENV_FILE
    echo "VITE_VERSION_INFO=\"${VERSION_INFO}\"" >> $FE_ENV_FILE
else
    info "$FE_ENV_FILE file found"
    found=`grep VITE_BACKEND_API_BASE ${FE_ENV_FILE}`
    if [[ -z $found ]]; then
        error "The .env file has no VITE_BACKEND_API_BASE variable defined. This is required, please edit the $FE_ENV_FILE file and add it."
        exit 1
    fi
    found=`grep VITE_VERSION_INFO ${FE_ENV_FILE} | cut -d "=" -f 2`
    if [[ -z $found ]]; then
        info "The .env file has no VITE_VERSION_INFO. Adding it at the end."
        echo "" >> ${FE_ENV_FILE}
        echo "VITE_VERSION_INFO=\"${VERSION_INFO}\"" >> $FE_ENV_FILE
    else
        info "Updating VITE_VERSION_INFO to ${VERSION_INFO} (was $found)"
        sed -i 's/VITE_VERSION_INFO=.*$/VITE_VERSION_INFO='${VERSION_INFO}'/' $FE_ENV_FILE
    fi
fi

export GIT_HASH=`git rev-parse --short HEAD`; docker compose up -d --build
# imagename=`docker compose images | tail -1 | awk  '{print $2}'`
# docker tag $imagename $imagename:$version_info