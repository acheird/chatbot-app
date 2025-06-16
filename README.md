Chat Application with Spring Boot Backend & React Frontend

Project Overview
This project is a simple chat application where users can sign up, log in, create chats, send messages, and receive responses from an AI assistant powered by Groq LLM API.

# Chat Application Frontend

This is a Next.js React frontend application for a chat system with user authentication.

## Features

- User signup, login, and logout.
- Token-based authentication with protected routes.
- Viewing and managing chat conversations (threads).
- Sending and receiving messages in real-time.
- Responsive UI with modals and error handling.

## Architecture Overview

- **Authentication:** Managed globally with `AuthContext` using React Context API.
- **API Integration:** All API calls go through `apiFetch` which attaches tokens and handles unauthorized responses.
- **Routing:** Next.js built-in routing with protected pages.
- **State Management:** React hooks (`useState`, `useEffect`) manage UI state.
- **Components:** Pages for login, signup, and chat interface.

## Getting Started

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run the development server:
   ```bash
   npm run dev


# Chat Application Backend:

## Features

- User registration and authentication with JWT
- User management (CRUD operations)
- Chat creation and management per user
- Messaging within chats with AI-powered responses
- Integration with Groq API for AI completions
- Secure access control with ownership checks

## Technologies Used

- Java 17+
- Spring Boot (Spring Data JPA, Spring Security)
- PostgreSQL database
- Hibernate ORM
- Groq AI API for chat completions
- REST APIs
- JWT authentication
