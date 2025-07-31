Further implement the following features from the README.md file

## Constraints

- For now, make it works on the frontend and client side only, with persistence stored in our frontend code/ client side where it's needed properly, the connection with real backend and real database will be done later.
- Mock the backend API calls and data handling for now, so that the frontend can be developed and tested independently.
- Mock the authentication and user management for now, so that the frontend can be developed and tested independently.
- The system should look and work properly and securely with mock data on the frontend. THIS FRONTEND WILL BE PRESENTED TO THE CLIENT TO ASK FOR THEIR APPROVAL OF CONCEPT AND DESIGN, SO IT MUST BE HIGHLY POLISHED AND FUNCTIONAL AND SECURE.
- Create mock data needed for the frontend to work, so that the frontend can be developed and tested independently for now.
- Must be built with Next.js and TypeScript
- Must use a modern UI library
- Must be responsive and mobile-friendly
- Must be secure and follow best practices for authentication and data handling

### In the future

- Must be scalable to handle multiple e-commerce platforms and shops (TikTok, Lazada, etc.)
- Must be able to handle a large number of orders and users
- Must be able to handle real-time updates for orders and shop statuses
- Must be able to handle multiple user roles (e.g., admin, shop owner, staff)
- Must be able to handle different user permissions for each role
- Must be able to handle different e-commerce platforms' APIs and data structures
- Must be able to handle different e-commerce platforms' authentication methods
- Must be able to handle different e-commerce platforms' order statuses and updates
- Must be able to handle different e-commerce platforms' product structures and updates

## Requirements

- Must support multiple Shopee shops per user
- Must support multiple users with different roles (e.g., Super Admin, Shop Owner, Shop Staff)
- Must support multiple e-commerce platforms (TikTok, Lazada, etc.)
- Signup and Login
- Dashboard should also show Shopee shops status all at once (20++ shops, with proper UX/UI to visualize the data for clean overview, also take into account that there could be other e-commerce platforms too)
- <!> feat: show status of what Shopee shop that the API is connected and working fine, and ready to connect (in case compromised Shopee API/ admin change shop account credentials)
- feat: show new orders when refreshed if there are new orders
  - polling in interval (interval time to poll latest data should also be configurable by user)
  - <!> show "last update" datetime from each shop
  - <!> show orders of finished scanning orders, and orders to scanned from shopee
- feat: show orders that are being scanned and orders that are finished scanning
