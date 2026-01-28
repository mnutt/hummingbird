#!/bin/bash

# When you change this file, you must take manual action. Read this doc:
# - https://docs.sandstorm.io/en/latest/vagrant-spk/customizing/#setupsh

set -euo pipefail
# Install node.js

# Discussion, issues and change requests at:
#   https://github.com/nodesource/distributions
#
# Script to install the NodeSource Node.js 16.x repo onto a
# Debian or Ubuntu system.

export DEBIAN_FRONTEND=noninteractive

echo "Installing the NodeSource Node.js 20.x repo..."

apt-get update
apt-get install -qq apt-transport-https

curl -sL https://deb.nodesource.com/setup_20.x | bash -

# Actually install node
apt-get install -qq nodejs git-core g++

exit 0
