# WebSocket Server  

## Simple Server to Client interaction

#### 1. Code Redeem Feature
##### When player's typed `SUMMER2016` on chat, Server will running command to give xp 3000 on sender.
#### 2. Dashboard Website
##### You can monitor who claims the redeem code on the Dashboard website.
#### 3. Server Broadcast
##### On the dashboard website you can send announcement messages from the server to the minecraft client.
#### 4. Database
##### The data will be stored at simple database using sqlite.
##
###### Run the server:
```bash
nodeman server.js
```
###### Or Run on development:
```bash
npm run dev
```
###### Website port:
```bash
3003
```
###### WsServer port:
```bash
8000
```
##
##### You can customize the port and command at:
```bash
server.js
```
##### You can customize website styling at:
```bash
base.ejs
```
##

## Tech used:
![Express.js](https://img.shields.io/badge/express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/ejs-%23B4CA65.svg?style=for-the-badge&logo=ejs&logoColor=black)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
