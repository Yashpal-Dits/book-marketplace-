Multi-Seller Book Marketplace Platform
A simple multi-seller book marketplace built with React, TypeScript, TanStack Query, Zustand, Tailwind CSS, Formik, Yup, Axios, React Hot Toast, React Icons, and JSON Server.

The project demonstrates a marketplace workflow where customers buy books from seller-specific listings, sellers manage their own inventory, and admins approve sellers/books and monitor marketplace operations.

Table of Contents
Project Objective
Tech Stack
Implemented Modules
Demo Credentials
Getting Started
Business Rules
Core Marketplace Concepts
Application Routes
Database Design
API Design
Folder Structure
User Stories
Assumptions
Edge Cases Covered
Test Cases
Future Improvements
Project Objective
Build a platform where:

Customers can browse and purchase books.
Multiple sellers can sell the same book.
Sellers manage their own inventory, pricing, and order processing.
Admin manages marketplace operations such as seller approval, book approval, and statistics.
The application focuses on marketplace workflows, role-based access, business rules, and clean front-end architecture using mock APIs with JSON Server.

Tech Stack
React
TypeScript
React Router
TanStack Query / React Query
Zustand
Tailwind CSS
Formik
Yup
Axios
React Hot Toast
React Icons
JSON Server
No extra library was added beyond the existing project stack.

Implemented Modules
Customer Portal
Implemented screens:

Home page
Login
Customer registration
Book listing
Book details
Seller comparison on book details
Cart
Checkout / place order
Order history and tracking
Customer features:

Browse approved and actively listed books.
Search books.
Sort books.
Filter by category.
View book details.
Compare sellers for the same book.
Select seller listing before adding to cart.
Add quantity to cart.
Place order without payment integration.
Track order status.
Seller Portal
Implemented screens:

Seller registration
Seller pending approval page
Seller dashboard
Listings and inventory management
Seller orders
Seller features:

Register as seller.
Seller status starts as PENDING.
Only approved sellers can access seller dashboard.
Create listing for an already approved book.
Request new book approval if book does not exist.
Update own listing price.
Update own listing stock.
Activate/deactivate own listing.
View seller-specific order items.
Update order item status.
Cancel order before shipment.
Search, sort, and paginate listings/orders.
Admin Portal
Implemented screens:

Admin dashboard
Seller approval
Book approval
Admin features:

View marketplace statistics.
View total sellers, customers, books, orders, listings, and revenue.
View pending sellers/books.
Approve sellers.
Reject sellers.
Approve books.
Reject books.
Search, filter, sort, and paginate sellers/books.
Demo Credentials
Admin
txt

Email: admin@bookbazaar.com
Password: admin123
Approved Seller
txt

Email: sellerA@bookbazaar.com
Password: seller123
Pending Seller
txt

Email: pending@bookbazaar.com
Password: seller123
Customer
txt

Email: customer@bookbazaar.com
Password: customer123
Getting Started
1. Install dependencies
Bash

npm install
2. Start JSON Server
Bash

npm run server
JSON Server runs on:

txt

http://localhost:4000
3. Start React app
In another terminal:

Bash

npm run dev
4. Start both together
Bash

npm run dev:all
5. Build
Bash

npm run build
6. Lint
Bash

npm run lint
Business Rules

Rule	Implementation
A book should exist only once	Duplicate ISBN is blocked when seller requests a new book.
Multiple sellers may sell the same book	Each seller creates a separate listing for the same book.
Inventory belongs to seller	Stock is stored on listings, not on shared book ownership.
Customer purchases from seller listing	Cart and order items store listingId.
Stock must never become negative	Cart and order placement validate stock before purchase.
Only approved sellers can create listings	Seller route and API check seller approval status.
Only approved books are visible to customers	Customer APIs filter by approved book status.
Approved book without listing should not be visible	Customer APIs show only approved books with active listings from approved sellers.
Seller cannot modify another seller listing	Seller update API checks listing ownership.
Seller cannot update another seller order	Seller order status API checks seller ownership.
Core Marketplace Concepts
Book
A Book is the master catalog record. It stores information that is common for all sellers:

ISBN
Title
Author
Publisher
Description
Cover image
Category
Approval status
A book should exist only once in the system.

Example:

txt

ISBN: 9781847941831
Title: Atomic Habits
Author: James Clear
Publisher: Random House
Listing
A Listing is a seller-specific offer for a book. It stores seller-owned commercial data:

Seller ID
Book ID
Price
MRP
Stock
Active/inactive status
Example:

txt

Book: Atomic Habits
Seller A: Price ₹399, Stock 10
Seller B: Price ₹380, Stock 5
The customer purchases from a listing, not directly from a book.

Application Routes
Customer Routes
Route	Description
/	Home page
/books	Browse/search/sort books
/books/:id	Book details and seller listings
/cart	Customer cart
/orders	Customer order history
/login	Login
/register	Customer registration
/seller-register	Seller registration
Seller Routes
Route	Description
/seller/pending-approval	Pending seller message
/seller/dashboard	Seller dashboard
/seller/listings	Listing and inventory management
/seller/orders	Seller order processing
Admin Routes
Route	Description
/admin/dashboard	Admin marketplace dashboard
/admin/sellers	Seller approval/rejection
/admin/books	Book approval/rejection
Database Design
The mock database is stored in:

txt

db.json
Entities
users
Stores login information.

Key fields:

id
email
password
role
createdAt
Roles:

CUSTOMER
SELLER
ADMIN
customers
Stores customer profile information.

Relationship:

txt

customers.userId → users.id
sellers
Stores seller business profile and approval status.

Relationship:

txt

sellers.userId → users.id
Statuses:

PENDING
APPROVED
REJECTED
books
Stores master catalog records.

Important fields:

isbn
title
author
publisher
description
status
createdBySellerId
Relationship:

txt

books.createdBySellerId → sellers.id
Statuses:

PENDING
APPROVED
REJECTED
listings
Stores seller-specific book offers.

Relationships:

txt

listings.bookId → books.id
listings.sellerId → sellers.id
Important fields:

price
mrp
stock
isActive
carts
Stores customer cart.

Relationship:

txt

carts.customerId → customers.id
cartItems
Stores cart line items.

Relationships:

txt

cartItems.cartId → carts.id
cartItems.listingId → listings.id
orders
Stores customer order header.

Relationship:

txt

orders.customerId → customers.id
orderItems
Stores purchased listing-level order items.

Relationships:

txt

orderItems.orderId → orders.id
orderItems.listingId → listings.id
orderItems.bookId → books.id
orderItems.sellerId → sellers.id
Each order item has its own seller-specific status.

API Design
This project uses JSON Server endpoints with Axios service modules.

Base URL:

txt

http://localhost:4000
Customer APIs
Register customer
txt

POST /users
POST /customers
POST /carts
Validation:

Email must be unique.
Password is required and validated by Yup.
Login
txt

GET /users?email={email}&password={password}
Validation:

Invalid credentials show error toast.
Get customer-visible books
txt

GET /books?status=APPROVED
GET /listings?isActive=true
GET /sellers?status=APPROVED
Customer catalog is filtered in the API layer so books appear only if they are approved and have at least one active listing from an approved seller.

Get book details
txt

GET /books/:id
GET /listings?bookId={bookId}&isActive=true
GET /sellers/:id
Add to cart
txt

POST /cartItems
PATCH /cartItems/:id
Validation:

Listing must be active.
Quantity cannot exceed stock.
Place order
txt

POST /orders
POST /orderItems
PATCH /listings/:id
DELETE /cartItems/:id
Validation:

Cart cannot be empty.
Fresh stock is checked before order creation.
Stock never becomes negative.
Seller APIs
Create listing
txt

POST /listings
Validation:

Seller must be approved.
Book must be approved.
Seller cannot create duplicate listing for same book.
Update listing
txt

PATCH /listings/:id
Validation:

Seller can update only own listing.
Stock cannot be negative.
Price and MRP are validated.
Request new book
txt

POST /books
Validation:

Seller must be approved.
ISBN must be unique.
New book status is PENDING.
View seller orders
txt

GET /orderItems?sellerId={sellerId}
GET /orders/:id
Update order status
txt

PATCH /orderItems/:id
PATCH /orders/:id
Validation:

Seller can update only own order item.
Cancel is not allowed after shipment.
Delivered/cancelled orders cannot be changed.
Admin APIs
Dashboard summary
txt

GET /sellers
GET /customers
GET /books
GET /orders
GET /listings
Seller approval
txt

GET /sellers
PATCH /sellers/:id
Payload example:

JSON

{
  "status": "APPROVED"
}
Book approval
txt

GET /books
PATCH /books/:id
Payload example:

JSON

{
  "status": "APPROVED"
}
Folder Structure
txt

src/
  api/              Axios API modules
  components/       Shared and feature UI components
  enums/            App enums
  hooks/            TanStack Query hooks and custom hooks
  interfaces/       TypeScript interfaces
  layouts/          Page layouts
  pages/            Customer, seller, admin, auth pages
  routes/           App routes and paths
  schemas/          Yup validation schemas
  store/            Zustand stores
  utils/            Utility functions
Important API modules:

txt

src/api/auth.api.ts
src/api/books.api.ts
src/api/cart.api.ts
src/api/orders.api.ts
src/api/seller.api.ts
src/api/admin.api.ts
Important hooks:

txt

src/hooks/useAuth.ts
src/hooks/useBooks.ts
src/hooks/useCart.ts
src/hooks/useOrders.ts
src/hooks/useSeller.ts
src/hooks/useAdmin.ts
User Stories
Customer
As a customer, I want to register so that I can place book orders.
As a customer, I want to login so that I can access my cart and orders.
As a customer, I want to browse approved books so that I can discover products.
As a customer, I want to search and sort books so that I can find books quickly.
As a customer, I want to view book details so that I can understand the book.
As a customer, I want to compare sellers so that I can choose the best price/stock.
As a customer, I want to add seller listings to cart so that I can purchase them.
As a customer, I want to place an order so that I can buy books.
As a customer, I want to track order status so that I know fulfillment progress.
Seller
As a seller, I want to register so that I can sell books.
As a seller, I want admin approval before selling so that marketplace quality is controlled.
As a seller, I want to create listings for approved books so that I can sell them.
As a seller, I want to request new books so that admin can add them to the catalog.
As a seller, I want to update price and stock so that my inventory stays accurate.
As a seller, I want to view my orders so that I can fulfill them.
As a seller, I want to update order status so that customers can track progress.
As a seller, I want to cancel orders before shipment when required.
Admin
As an admin, I want to view dashboard statistics so that I can monitor marketplace health.
As an admin, I want to approve sellers so that only verified sellers can sell.
As an admin, I want to reject sellers so that invalid sellers cannot access seller features.
As an admin, I want to approve books so that only valid books are visible in the marketplace.
As an admin, I want to reject books so that invalid catalog records are not used.


Assumptions

Real payment gateway integration is out of scope.
Real courier integration is out of scope.
Refunds, invoices, GST, email, and SMS are out of scope.
Passwords are stored in plain text only because this is a mock JSON Server project.
Admin user is seeded in db.json.
Seller approval is done manually by admin.
Book approval is done manually by admin.
Customer sees only books that are approved and actively listed by approved sellers.
Cart stores seller listing information through listingId.
Order items keep price snapshot using priceAtPurchase.
Parent order status is synced based on order item statuses.
Edge Cases Covered
Edge Case	Covered
Duplicate ISBN submission	Yes
Seller stock reaches zero	Yes
Customer orders more than available stock	Yes
Seller tries to modify another seller listing	Yes
Seller registration rejected	Yes
Customer adds same book from multiple sellers	Yes, because cart stores listing IDs
Book pending approval	Yes, hidden from customer catalog
Approved book without listing	Yes, hidden from customer catalog
Out-of-stock listing	Yes
Invalid login credentials	Yes
Seller cancels order before shipment	Yes
Seller cancels after shipment	Blocked
Pending seller accessing seller dashboard	Blocked
Rejected seller accessing seller features	Blocked
Test Cases


Functional Test Cases

1	Customer registers with valid details	Customer account and cart are created.
2	Customer logs in with valid credentials	Customer is logged in.
3	Customer browses books	Only approved and actively listed books are shown.
4	Customer searches by title	Matching books are displayed.
5	Customer opens book details	Book information and seller listings are shown.
6	Customer adds listing to cart	Cart item is created with selected listing.
7	Customer places order	Order and order items are created; stock is reduced.
8	Seller registers	Seller status becomes PENDING.
9	Admin approves seller	Seller status becomes APPROVED; seller can access dashboard.
10	Seller creates listing for approved book	Listing is created and visible to customers.
11	Seller requests new book	Book is created with PENDING status.
12	Admin approves book	Book status becomes APPROVED.
13	Seller updates stock	Listing stock updates correctly.
14	Seller updates order status	Order moves through valid status flow.
15	Admin dashboard loads	Marketplace statistics are displayed.


Negative Test Cases


1	Register with duplicate email	Error message is shown.
2	Login with invalid credentials	Login fails with error toast.
3	Seller submits duplicate ISBN	Error message is shown.
4	Customer adds quantity greater than stock	Request is blocked with stock error.
5	Seller tries to update another seller listing	Request is blocked.
6	Pending seller opens seller dashboard	Redirected to pending approval page.
7	Seller cancels shipped order	Request is blocked.
8	Customer places order with empty cart	Error message is shown.
9	Seller creates listing for pending book	Request is blocked.
10	Rejected seller opens seller dashboard	Access is blocked.




Future Improvements
Add real backend with authentication and authorization.
Add JWT/session-based security.
Add admin catalog edit/delete features.
Add seller reports and analytics.
Add order cancellation reason.
Add customer profile management.
Add payment gateway integration.
Add invoice generation.
Add email notifications.
Add real inventory locking for concurrent orders.
Add automated test suite.
Final Notes
This project separates Books and Listings because a marketplace catalog and seller offers are different concepts.

Books represent the shared master catalog.
Listings represent individual seller offers.
Inventory belongs to sellers, so stock is stored on listings.
Customers purchase from listings, not directly from books.
Admin controls seller and book approval to maintain marketplace quality.