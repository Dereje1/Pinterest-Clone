#Get image
FROM node:18
#Assign workdir and copy all files
WORKDIR /tmp
COPY . .
#Install packages and build client
RUN npm install
RUN npm run build_client
RUN npm run build_server
#Expose default port and run
EXPOSE 3000
CMD [ "npm", "start" ]