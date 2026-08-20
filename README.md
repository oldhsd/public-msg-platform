# Public Msg

A simple backend project where users can sign up and create posts/messages.

> Currently, only the backend is implemented.

## Features

- User signup
- JWT authentication
- Authentication middleware
- Create posts/messages
- MongoDB database
- Mongoose
- Zod validation
- Populate author information

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Zod

## How it works

Users can sign up and receive a JWT token.  
The token is verified using authentication middleware before creating a post.

Posts are connected to the user who created them, so the author's username can be retrieved using Mongoose `populate()`.

## Status

🚧 Backend only — frontend is not implemented yet.
