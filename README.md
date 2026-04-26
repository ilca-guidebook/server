# server

Backend server for the Israel Climbers Association mobile app (Expo/React Native).

Serves content from Contentful CMS and provides APIs for user authentication, push notifications, and data management.

## Prerequisites

- Node.js v20+
- Yarn
- ngrok (for local development with mobile client)

## Setup

1. Install dependencies: `yarn install`
2. Create `.env` file (see below)
   a. secrets can be found here [notion link](https://www.notion.so/secrets-2caf6f02042f80f79367edf0889d75c0)
3. Start server: `yarn start`

### Required `.env` file format

```
MONGO_CONNECTION=<mongodb_connection>
SPACE_ID=<contentful_space_id>
JWT_SECRET=<your_secret>
PORT=3000
accessToken=<contentful_access_token>
```

## Running Locally

Start the server:

```
yarn start
```

> For local testing on IOS client + server development, run ngrok in a separate terminal to expose the server:

```
ngrok http 3000
```
