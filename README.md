# Chat Bot Application

## Installation Guide

### Requirements

- [Nodejs](https://nodejs.org/en/download)
- [Mongodb](https://www.mongodb.com/docs/manual/administration/install-community/)

Both should be installed and make sure mongodb is running.

### Installation

#### First Method

```shell
git clone https://github.com/Sidharth-002/mern-chatbot-application
cd mern-chatbot-application
```

Now rename env files from .env.example to .env

```shell
cd frontend
mv .env.example .env
cd ..
cd backend
mv .env.example .env
cd ..
```

We are almost done, Now just start the development server.

For Frontend.

```shell
cd frontend
npm install
npm run dev
```

For Backend.

Open another terminal in folder, Also make sure mongodb is running in background.

```shell
cd backend
npm install
npm run dev
```

Done! Now open localhost:3000 in your browser.

#### Second Method

Also will try to implement using dockers

#### Will make it live ASAP! Stay tuned
