# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=23.9.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /server

COPY server/package*.json ./
RUN npm ci --only=production

# Copy the rest of the server source code
COPY server/ ./

# Expose the port that the application listens on.
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
