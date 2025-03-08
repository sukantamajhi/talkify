# Talkify

Talkify is a modern real-time chat application built with Next.js, Socket.IO, and MongoDB. It enables seamless communication with real-time messaging, user authentication, and chat room functionality.

<!-- ![Talkify Logo](https://via.placeholder.com/150x150?text=Talkify) -->

## 🌟 Features

-   **Real-time Messaging**: Instant message delivery using Socket.IO
-   **User Authentication**: Secure login and registration system
-   **Chat Rooms**: Create and join different chat rooms
-   **Responsive Design**: Works seamlessly on desktop and mobile devices
-   **Message History**: Access previous messages when joining a room
-   **System Notifications**: Receive notifications when users join or leave
-   **Dark Mode Support**: Comfortable viewing in low-light environments
-   **Connection Status**: Visual indicators for connection status

## 🛠️ Tech Stack

### Frontend

-   **Next.js**: React framework for building the user interface
-   **TypeScript**: Type-safe JavaScript
-   **Socket.IO Client**: Real-time bidirectional communication
-   **Tailwind CSS**: Utility-first CSS framework for styling

### Backend

-   **Node.js**: JavaScript runtime for the server
-   **Express**: Web framework for Node.js
-   **Socket.IO**: Real-time event-based communication
-   **MongoDB**: NoSQL database for storing messages and user data
-   **Redis**: In-memory data structure store for pub/sub messaging
-   **Kafka**: Distributed event streaming platform for message processing
-   **JWT**: JSON Web Tokens for authentication

## 📋 Prerequisites

-   Node.js (v18 or higher)
-   MongoDB
-   Redis
-   Kafka (optional, for high-scale deployments)
-   Docker and Docker Compose (optional, for containerized deployment)

## 🚀 Getting Started

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/sukantamajhi/talkify.git
    cd talkify
    ```

2. Install dependencies for both client and server:

    ```bash
    # Install client dependencies
    cd client
    bun install

    # Install server dependencies
    cd ../server
    bun install
    ```

3. Set up environment variables:
    - Copy `.env.example` to `.env` in the server directory
    - Update the values with your configuration

### Running the Application

#### Development Mode

1. Start the server:

    ```bash
    cd server
    bun run dev
    ```

2. Start the client:

    ```bash
    cd client
    bun run dev
    ```

3. Open your browser and navigate to `http://localhost:3000`

<!-- #### Using Docker

1. Build and start the containers:

    ```bash
    docker-compose up -d
    ``` -->

<!-- 2. Open your browser and navigate to `http://localhost:3000` -->

## 🔧 Configuration

### Server Environment Variables

| Variable        | Description                                      | Default                           |
| --------------- | ------------------------------------------------ | --------------------------------- |
| PORT            | Server port                                      | 5000                              |
| MONGO_URI       | MongoDB connection string                        | mongodb://localhost:27017/talkify |
| JWT_SECRET      | Secret for JWT token generation                  | -                                 |
| REDIS_HOST      | Redis host                                       | localhost                         |
| REDIS_PORT      | Redis port                                       | 6379                              |
| KAFKA_HOST      | Kafka host                                       | localhost                         |
| KAFKA_PORT      | Kafka port                                       | 9092                              |
| ALLOWED_ORIGINS | Comma-separated list of allowed origins for CORS | http://localhost:3000             |

### Client Environment Variables

| Variable               | Description               | Default               |
| ---------------------- | ------------------------- | --------------------- |
| NEXT_PUBLIC_SERVER_URL | URL of the backend server | http://localhost:5000 |

## 📁 Project Structure

```
talkify/
├── client/                # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   └── public/            # Static assets
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── database/      # Database connection
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── logger/            # Logging configuration
```

## 🔒 Authentication

Talkify uses JWT (JSON Web Tokens) for authentication. When a user logs in, a token is generated and stored in localStorage. This token is used for authenticating API requests and Socket.IO connections.

## 🌐 Socket.IO Events

| Event             | Description                     |
| ----------------- | ------------------------------- |
| `room::join`      | Join a chat room                |
| `room::leave`     | Leave a chat room               |
| `message::send`   | Send a message to a room        |
| `getLastMessages` | Get previous messages in a room |
| `message`         | Receive a new message           |
| `lastMessages`    | Receive previous messages       |
| `message_error`   | Receive error notifications     |

## 🚢 Deployment

### Server Deployment

The server can be deployed to any Node.js hosting platform such as:

-   Heroku
-   AWS Elastic Beanstalk
-   Digital Ocean
-   Railway

### Client Deployment

The Next.js client can be deployed to:

-   Vercel (recommended)
-   Netlify
-   AWS Amplify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

-   [Socket.IO](https://socket.io/)
-   [Next.js](https://nextjs.org/)
-   [MongoDB](https://www.mongodb.com/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Redis](https://redis.io/)
-   [Kafka](https://kafka.apache.org/)
