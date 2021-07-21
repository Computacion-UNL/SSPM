FROM node:12-alpine 

WORKDIR /

COPY ./package.json ./

RUN npm install && npm cache clean --force --loglevel=error

COPY . .

CMD [ "npm", "run", "start:prod"]