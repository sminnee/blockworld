FROM node:15-alpine
WORKDIR /app
RUN apk add git 
RUN npm install -g bower browserify
COPY package.json package-lock.json bower.json ./
RUN npm install --production
RUN bower --allow-root install
COPY . .
RUN npm run browserify
EXPOSE 3000
CMD tools/www