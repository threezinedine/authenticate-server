# Centralized Authentication Service

A highly performant, stateless Centralized Identity Provider (Auth Service) and client SDKs (`ntt-client-auth` and `ntt-client-auth-node`) for microservice architectures.

## Overview

This project provides a standalone Authentication Server (FastAPI) that acts as the single source of truth for all users. Target microservices do not need to make network requests to the Auth server to validate active user sessions; instead, they use Asymmetric Cryptography (RS256) and a JSON Web Key Set (JWKS) to mathematically verify tokens locally.

### Key Features
- **Stateless Asymmetric JWT Verification**: High-performance token validation using an exposed JWKS endpoint (`/.well-known/jwks.json`). Target microservices verify tokens fully locally.
- **Relational Database**: SQLAlchemy 2.0 mapping users, OAuth accounts, detailed user profiles, and RBAC roles.
- **S3-Compatible Object Storage**: Users' physical avatar files are saved to S3/MinIO for durability and scalability.
- **Comprehensive SDKs**: Drop-in Python (`ntt-client-auth`) and Node.js (`ntt-client-auth-node`) libraries for instantly protecting endpoints and fetching user data.
- **Server-Side Rendered Frontends**: Built-in jQuery/Jinja2 pages for `/login`, `/register`, `/profile`, and `/admin`.
- **High Security**: `HttpOnly` refresh tokens, multi-key rotation capabilities, and strict rate-limiting to prevent brute force.

## Project Structure

This monorepo manages the primary Authentication Server, isolated UI components, and the language-specific client SDKs.

- `server/` - The Python FastAPI Authentication Server & Frontend Logic.
  - `app/` - Core API logic.
  - `frontend/` - Server-Rendered UI Interface.
    - `pages/` - Full Jinja2 HTML Pages (Login, Admin).
    - `components/` - Reusable isolated UI modules (HTML/CSS/JS).
    - `assets/` - Global assets (global.css, main.js).
- `sdk-python/` - The Python Client SDK (`ntt-client-auth`), installable via PIP/uv.
- `sdk-node/` - The Node.js Client SDK (`ntt-client-auth-node`), installable via NPM directly from GitHub.
- `shared/` - Shared business logic and utilities across Python projects.
- `examples/` - Demonstration projects (`fastapi-app` and `express-app`) validating the E2E lifecycle.
- `helper.py` - A master CLI script located at the repository root to control and manage the entire monorepo (`python helper.py run server`, `python helper.py test sdk-python`).

## Developer Integration

### Python (FastAPI) Waitlist Integration
Install the internal SDK:
```bash
pip install -e ./sdk-python
```
Usage:
```python
from ntt_client_auth import get_current_user, require_role
from fastapi import FastAPI, Depends

app = FastAPI()

@app.get("/items")
def get_items(user: dict = Depends(get_current_user)):
    return {"message": f"Hello User {user['id']}"}
```

### Node.js (Express) Integration
Install the SDK directly from the Git Repository:
```bash
npm install git+https://github.com/my-repo/ntt-client-auth-node.git
```
Usage:
```javascript
const express = require('express');
const { requireAuth, requireRole } = require('ntt-client-auth-node');

const app = express();

app.get('/items', requireAuth, (req, res) => {
    res.json({ message: `Hello User ${req.user.id}` });
});
```

## Security & Extensibility

- **Very Short-Lived Access Tokens**: Mitigates the fact that target microservices verify tokens statelessly; allows for rapid database-level revocation via Refresh Tokens.
## Testing & Resilience

We utilize a strict validation lifecycle for this system:
- **Storybook**: Visual isolation development for HTML/CSS Frontend Components.
- **Jest/JSDOM**: Unit testing for JS/jQuery validation logics.
- **FastAPI TestClient**: Backend endpoint integration tests.
- **Cypress E2E**: End-to-end user journey mapping hitting live endpoints.
- **Stress-Test Ready**: Configured for rapid load testing via `helper.py` to guarantee throughput numbers across services.
