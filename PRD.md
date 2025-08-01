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
- feat: in "Scan Orders" page, show orders that are being scanned and orders that are finished scanning
- feat: example Excel order files for user to download and test upload to the system
- The "File Upload" workflow is:
  1. User uploads an Excel or CSV file containing their order data.
  2. The system processes the uploaded file and extracts relevant information.
  3. The user can preview the extracted data before finalizing the upload.
  4. Once confirmed, the data is sent to the backend for storage and further processing.
  5. The user receives a notification once the processing is complete, along with any relevant insights or calculations.
- The "Scan Orders" workflow is:
  1. In physical world, user initiates the barcode scanning process of each Shopee Parcel AWB (Air Waybill) that is the Parcel Order Detail Sheet (ใบปะหน้าพัสดุ), that will give us the order_sn (หมายเลขคำสั่งซื้อ) as input from barcode reading and filled in an input field of the application.
  2. User doesn't have to selects a Shopee shop from their connected accounts. The system automatically detects the shop based on the order_sn and will map it to the latest orders from the Shopee API.
  3. The system fetches the latest orders from the Shopee API for every shops that user owns .
  4. The user can view the fetched orders in a list format, with options to filter and sort.
  5. The user can mark orders as processed or completed, which updates their status in the system.
  6. The system provides insights on order processing times, shipping statuses, and any issues encountered.
  7. The user can export the processed orders for record-keeping or further analysis.
  8. The system allows for real-time updates on order statuses, ensuring the user is always informed of the latest developments.
  9. The system should handle errors gracefully, providing clear feedback to the user if any issues arise during the scanning or processing of orders.
  10. The system should allow users to re-scan orders if needed, ensuring flexibility in the order processing workflow.
  11. The system should provide a history of scanned orders, allowing users to track past activities and review order processing details.
  12. The system should support multiple scanning methods, including manual entry and barcode scanning, to accommodate different user preferences and scenarios.
  13. The system should allow users to set reminders or notifications for pending orders, ensuring timely processing and follow-up.