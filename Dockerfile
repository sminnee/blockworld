# Base executor
FROM registry.digitalocean.com/tangerine/shared:blockworld-base-0.0.1

# Files of relevance to production hosting - see .dockerignore for excluded files
COPY . .

# Package build commands
RUN npm install --production && bower --allow-root install && npm run browserify

# Start script and port
EXPOSE 3000
CMD tools/www