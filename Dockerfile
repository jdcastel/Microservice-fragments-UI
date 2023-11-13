# Build and serve fragments-ui with nginx
# Stage 0: Build Stage
# Use node version 16.14-alpine3.14 as the base version
FROM node:16.14-alpine3.14@sha256:a93230d096610a42310869b16777623fbcacfd593e1b9956324470f760048758 AS base

# Metadata information
LABEL maintainer="Juan Castelblanco <jdrodriguez-castelbl@myseneca.ca>" \
      description="Fragments-ui Dockerfile"

# Reduce npm spam when installing within Docker
# Disable colour when run inside Docker
ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Create the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json /app/

# Install Node.js
RUN npm install --no-package-lock

################################################

# Stage 1: Production Stage
# Use the same base image as the production stage
FROM node:16.14-alpine3.14@sha256:a93230d096610a42310869b16777623fbcacfd593e1b9956324470f760048758 AS production

# Create the working directory
WORKDIR /app

# Copy files from the 'base' stage to the working directory
COPY --from=base /app /app
# Copy all of our source in
COPY . .

#Run the build in order to create
RUN npm run build

################################################

# Stage 2: Server Stage
# Start with nginx on Debian
FROM nginx:stable-alpine@sha256:62cabd934cbeae6195e986831e4f745ee1646c1738dbd609b1368d38c10c5519 AS server

# copy all of the contents of dist/ to the location where nginx expects to find our HTML web content.
COPY --from=production /app/dist/ /usr/share/nginx/html/

# nginx will be running on port 80
EXPOSE 80

# Healthcheck command
HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
    CMD curl --fail localhost:80 || exit 1