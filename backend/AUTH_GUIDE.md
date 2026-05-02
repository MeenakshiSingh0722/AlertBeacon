# AlertBeacon Auth Documentation

Authentication is handled via JWT (JSON Web Tokens).

## Endpoints

### 1. Register a User
Create a new user account.
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
           "email": "admin@alertbeacon.com",
           "org_name": "AlertBeacon Admin",
           "password": "adminpassword",
           "role": "admin"
         }'
```

### 2. Login
Authenticate and receive access/refresh tokens.
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin@alertbeacon.com&password=adminpassword"
```
**Response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

### 3. Get Current User Profile
Requires a valid access token.
```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Access Token
Exchange a refresh token for a new access token.
```bash
curl -X POST "http://localhost:8000/api/v1/auth/refresh?refresh_token=YOUR_REFRESH_TOKEN"
```

### 5. Create Incident (Protected)
Requires a valid access token.
```bash
curl -X POST "http://localhost:8000/api/v1/incidents/" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "title": "Manual Crisis Alert",
           "description": "Test manual incident creation",
           "category": "safety",
           "severity_label": "high",
           "location_name": "Mumbai, India"
         }'
```

### 6. Delete Incident (Admin Only)
Requires a valid access token from an 'admin' user.
```bash
curl -X DELETE "http://localhost:8000/api/v1/incidents/INCIDENT_UUID" \
     -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```
