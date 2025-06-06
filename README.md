
# 🏗 NestJS API Project

A simple NestJS API with user management, JWT-based authentication, health check, and match operations. Database is initialized via SQL scripts in `src/database/`.

---

## 🔧 Setup & Installation

### 1. Clone & Install

```bash
git clone https://github.com/gpodergajs/secret_match.git
cd secret_match
npm install
```

### 2. Environment Variables

Edit the `.env` file with your settings:

```env
# Database Configuration
DB_TYPE=postgres
DB_NAME=postgres
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_PORT=5433
DB_HOST=localhost

# JWT Configuration
JWT_SECRET=jwt_secret
JWT_EXPIRES_IN=1H

# Application Configuration
NODE_ENV=development
PORT=8080

# Mail service configuration
EMAIL_USER=something@gmail.com
EMAIL_PASS=pass
EMAIL_HOST=gmail
```

---

### 3. Database Initialization

In `src/database/`, you have:

- `schema.sql` – defines tables  
- `data.sql` – optional seed data  

Execute:

```bash
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f src/database/schema.sql
# Optional:
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f src/database/data.sql
```
or manually trigger sql files in your database manager.
---

### 4. Start the App

- **Development** mode:

  ```bash
  npm run start:dev
  ```
---

## 🚀 API Endpoints

### Health Check – `AppController`

- **GET** `/health`  
  Returns:
  ```json
  { "status": "ok" }
  ```

---

### User Management – `UsersController`

- **POST** `/users/register`  
  Body:
  ```json
  {
    "email": "foo@bar.com",
    "password": "securepass",
    "name": "some name",
    "preferences": {
      "pref1": "pref1"
    },
    "message" : "message"
  }
  ```
  Returns created user info

---

### Authentication – `AuthController`

- **POST** `/users/login`  
  Body:
  ```json
  {
    "email": "foo@bar.com",
    "password": "securepass"
  }
  ```
  Returns a JWT token on success - access token

---

### Match Management – `MatchController`

- **POST** `/match/join`  
  Body:
  ```json
  {
    "eventId": 1
  }
  ```
  Joins a user to an event. Must be authenticated.

- **GET** `/match/view`  
  Get user matches for latest round per event -> match/view?eventId=1 etc. Must be authenticated.

- **POST** `/match/assign`  
  Body:
  ```json
  {
    "eventId": 1
  }
  ```
  Assigns all users of an event a match. Round based, each round creates new matches. Only an admin can assign matches. Must be authenticated.

---

## ✅ Usage Flow

1. Configure `.env` with your DB JWT and mailing settings  
2. Run SQL scripts: `schema.sql` (and optionally `data.sql`)  
3. Start the server with `npm run start:dev`  
4. Use Swagger/Postman/cURL to:
   - Health check: `GET /health`
   - Register: `POST /users/register`
   - Login: `POST /users/login` → receive token
   - Join event
   - Perform matching actions as an admin
5. Email service triggers after each match assign. Properly configure env variables.
---

