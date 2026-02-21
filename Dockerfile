FROM node:18

# Python install
RUN apt-get update && apt-get install -y python3 python3-pip

# Edge TTS + mutagen + cloudinary install
RUN pip3 install edge-tts mutagen cloudinary --break-system-packages

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]