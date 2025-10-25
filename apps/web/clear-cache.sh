#!/bin/bash

# Clear Next.js cache and node_modules
echo "Clearing Next.js cache and node_modules..."

# Remove .next directory
rm -rf .next

# Remove node_modules
rm -rf node_modules

# Remove package-lock.json
rm -f package-lock.json

# Clear npm cache
npm cache clean --force

echo "Cache cleared successfully!"
echo "Run 'npm install' to reinstall dependencies"
echo "Then run 'npm run dev' to start the development server"
