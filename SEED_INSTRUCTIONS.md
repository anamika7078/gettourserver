# How to Seed Database with Dummy Data on Render

## Option 1: Using Render Shell (Recommended)

1. Go to your Render Dashboard
2. Click on your backend service
3. Click on the "Shell" tab (or "Console" in some versions)
4. Run the following command:
   ```bash
   npm run seed
   ```

## Option 2: Using Render's Environment Variables

You can add a one-time script by setting an environment variable, but the easiest way is using the Shell.

## Option 3: SSH into Render Instance

If you have SSH access enabled:
```bash
ssh your-render-instance
cd /opt/render/project/src
npm run seed
```

## What Will Be Seeded

The seed script will add:

- ✅ **Activity Categories** (5 categories)
- ✅ **Activities** (5 activities)
- ✅ **Cities** (8 cities: Dubai, Paris, Tokyo, New York, London, Barcelona, Singapore, Istanbul)
- ✅ **City Tour Categories** (6 categories)
- ✅ **City Packages** (4 packages)
- ✅ **Holiday Categories** (6 categories)
- ✅ **Hotels** (3 hotels with rooms)
- ✅ **Holiday Packages** (4 packages)
- ✅ **Cruise Categories** (5 categories)
- ✅ **Cruise Packages** (3 cruises)
- ✅ **Visas** (6 visa types)

## After Seeding

Once the seed script completes, your frontend will be able to display:
- Activities on the Activities page
- Hotels on the Hotels page
- Holiday packages on the Tours/Holidays page
- Cruise packages on the Cruises page
- Visa applications on the Visas page
- City packages on the City Tours page

## Troubleshooting

If you get errors:
- Make sure all tables are created first (wait for server to fully start)
- Check that the database connection is working
- Verify all environment variables are set correctly

