# Backend Source Code

## API Endpoints

### Health Check

To verify the server is running correctly, you can test the health endpoint.

**With the backend running**, open a separate terminal and run:

```bash
curl http://localhost:4000/health
```

You should receive a response like:
```json
{
  "status": "ok",
  "timestamp": "2025-10-25T09:15:30.123Z"
}
```

This confirms the server is up and responding to requests.

## File Structure

- **`app.js`** - Main Express application with route definitions and middleware