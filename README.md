# OpenChat 🎥

A fast, secure, and modern random video chat application where you can meet new people from around the world!

## Demo

[Add a GIF or screenshot here]

## Features

- **Video Chat:** Instantly connect face-to-face with a random stranger.
- **Text Chat:** Send text messages alongside your video stream.
- **Interests Matching:** Enter topics you love to pair up with like-minded people.
- **Typing Indicator:** See when the other person is typing a message.
- **Online Counter:** See how many users are currently looking for a chat.
- **Common Interests Badge:** Highlights the shared interests you have with your partner.
- **Report Button:** Keep the community safe by reporting inappropriate behavior.
- **Spy Mode:** Ask a question and watch two strangers discuss it.
- **Mobile Responsive:** Works beautifully on phones, tablets, and desktop computers.
- **Mute/Camera Toggle:** Turn off your microphone or camera at any time.
- **Chat-Only Mode:** Turn off video completely and just use text.
- **Country Display:** See what country your chat partner is connecting from.

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Builds the user interface you see and interact with on the screen. |
| **Backend** | Node.js + Express | The core server that handles API requests and serves the application. |
| **Real-time** | WebSockets (ws) | Maintains a persistent connection to send messages back and forth instantly. |
| **P2P Video** | WebRTC | Connects your browser directly to another user's browser to stream live video. |
| **Styling** | Tailwind CSS | Makes the app look beautiful with pre-built design utility classes. |
| **Security** | Arcjet | Protects the app from bad actors, bots, and abuse. |

## How It Works

Video chatting in the browser uses a technology called **WebRTC** (Web Real-Time Communication). Here is a simple plain-English explanation of how two strangers connect:

1. **Saying Hello to the Server:** When you open the app, your browser connects to our central server using a WebSocket (a continuous, two-way connection).
2. **Finding a Partner:** You tell the server, "I'm looking for someone to chat with!" The server looks for another person waiting in line (matching interests if provided).
3. **The Introduction (Signaling):** Because browsers can't easily find each other on the massive internet, the server acts as an introducer. You send a "Hi, this is how you can reach my video feed" message to the server, and the server passes it to your new partner.
4. **Shaking Hands:** Your partner receives your message and sends one back through the server saying, "Got it, and here is how you can reach *my* video feed!"
5. **Direct Connection (Peer-to-Peer):** Once both browsers know how to reach each other, they connect directly. The video and audio flow straight from your computer to theirs, completely bypassing our server!

## Getting Started

Follow these steps to run the project on your own computer.

### Prerequisites

Before you begin, make sure you have:
- **Node.js** (version 18 or higher) installed on your computer.
- **Git** installed to download the code.
- A **webcam** (or virtual camera) to test the video features.

### Installation

First, download the code and navigate into the project folder:

```bash
git clone https://github.com/yourusername/openchat.git
cd openchat
```

You need to install the dependencies (the pre-packaged code the app relies on) for both the backend server and the frontend UI:

```bash
# Install backend dependencies
npm install

# Move into the frontend folder and install its dependencies
cd ui
npm install
cd ..
```

### Environment Setup

The application uses environment variables (secret settings that shouldn't be shared publicly) to configure things like security and database connections. 

1. Copy the example settings file to create your own:
   ```bash
   cp .env.example .env
   ```
2. Open the newly created `.env` file in your code editor and fill in the values:
   - `PORT`: The port number the backend server will run on (usually `3000`).
   - `ARCJET_KEY`: Your security key from Arcjet (used to protect the app).
   - *Any other variables listed in the file.*

### Running Locally

To start the app, you will need to run two terminal windows (or tabs) at the same time:

**Terminal 1: Start the Backend Server**
```bash
# Make sure you are in the root 'openchat' folder
npm run dev
```

**Terminal 2: Start the Frontend UI**
```bash
# Move into the ui folder
cd ui
npm run dev
```

### Verify It Works

Open your web browser and go to `http://localhost:5173` (or whatever URL the Vite frontend terminal gives you). 
You should see the OpenChat interface! When you click to start chatting, your browser will ask for permission to use your camera and microphone.

## Project Structure

Here is a quick map of where everything lives to help you find your way around:

```text
openchat/
├── src/                    # Backend server code
│   ├── index.js            # The main entry point that starts the server
│   ├── arcjet.js           # Security rules and configurations
│   ├── routes/             # API endpoints (e.g., /api/users)
│   └── ws/                 # WebSocket logic (handles matching and chat rooms)
├── ui/                     # Frontend React application
│   ├── src/                # All the frontend code
│   │   ├── components/     # Reusable UI pieces (buttons, chat boxes)
│   │   ├── hooks/          # Custom React logic (like WebRTC management)
│   │   ├── App.jsx         # The main layout of the website
│   │   └── index.css       # Global styles and Tailwind configuration
│   ├── index.html          # The blank webpage that loads the React app
│   └── vite.config.js      # Configuration for the frontend build tool
├── drizzle/                # Database schemas and migrations
├── .env.example            # Template for required secret environment variables
└── package.json            # List of backend dependencies and terminal scripts
```

## Contributing

See CONTRIBUTING.md

## License

MIT
