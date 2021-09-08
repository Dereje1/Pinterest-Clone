#Get image
FROM node:14
#Assign workdir and copy all files
WORKDIR /tmp
COPY . .
#Install packages and build client
RUN npm install
RUN npm run build
#Expose default port and run
EXPOSE 3000
CMD [ "node", "./bin/www" ]