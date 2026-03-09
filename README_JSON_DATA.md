# JSON Data Setup Guide

This backend now supports using JSON files as a dummy database. This is useful when:
- Database connection is not available
- You want to test without a database
- You're using free hosting services with limited database access

## Setup

### 1. Enable JSON Data Mode

Set the environment variable `USE_JSON_DATA=true` in your `.env` file or Render environment variables:

```bash
USE_JSON_DATA=true
```

### 2. JSON Data Files

All JSON data files are located in the `backend/data/` directory:
- `cities.json` - City data
- `activities.json` - Activity data
- `hotels.json` - Hotel data
- `holidays.json` - Holiday package data
- `cruises.json` - Cruise package data
- `visas.json` - Visa data
- `cityPackages.json` - City tour package data

### 3. How It Works

When `USE_JSON_DATA=true`:
- Controllers will first try to load data from JSON files
- If JSON data is available, it will be returned
- If JSON data is not available or empty, it falls back to the database
- If database also fails, it tries JSON as a last resort

### 4. API Endpoints

All existing API endpoints work the same way:
- `GET /api/cities` - Get all cities
- `GET /api/activities` - Get all activities
- `GET /api/hotels` - Get all hotels
- `GET /api/holidays` - Get all holidays
- `GET /api/cruises` - Get all cruises
- `GET /api/visas` - Get all visas
- `GET /api/city-packages` - Get all city packages

### 5. Render Deployment

For Render deployment with backend URL: `https://gettourserver.onrender.com`

1. Set environment variable in Render dashboard:
   - Key: `USE_JSON_DATA`
   - Value: `true`

2. The backend will automatically use JSON data when the database is not available

### 6. Updating JSON Data

You can edit the JSON files directly in `backend/data/` to update the dummy data. The changes will be reflected immediately when the server restarts.

## Notes

- JSON data is read synchronously on each request (suitable for small datasets)
- For production with large datasets, consider using a proper database
- Image paths in JSON should match files in the `uploads/` directory
- All JSON data matches the structure expected by the frontend

