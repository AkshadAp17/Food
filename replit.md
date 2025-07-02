# FoodieExpress - Food Delivery Application

## Overview

FoodieExpress is a modern food delivery application built with a full-stack TypeScript architecture. The application provides a comprehensive platform for users to browse restaurants, view menus, manage shopping carts, place orders, and track deliveries. The system features a React-based frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Email Service**: Nodemailer for order confirmations
- **API Design**: RESTful API with JSON responses

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Management**: Type-safe database schema with Zod validation
- **Migrations**: Drizzle Kit for database schema migrations
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed session store
- **User Management**: Automatic user creation and profile management
- **Authorization**: Route-level authentication middleware

### Restaurant Management
- **Restaurant Catalog**: Display of available restaurants with ratings and cuisine types
- **Menu Management**: Categorized food items with pricing and availability
- **Search & Filtering**: Restaurant and food item search functionality

### Shopping Cart System
- **Cart Persistence**: User-specific cart storage in database
- **Real-time Updates**: Optimistic updates with TanStack Query
- **Cart Sidebar**: Sliding cart interface with quantity management

### Order Processing
- **Order Creation**: Multi-step checkout process with delivery information
- **Order Tracking**: Real-time order status updates
- **Email Notifications**: Automated order confirmation emails
- **Order History**: User order history and tracking

### UI/UX Components
- **Responsive Design**: Mobile-first responsive design
- **Component Library**: Comprehensive UI components from shadcn/ui
- **Loading States**: Skeleton loading and error handling
- **Toast Notifications**: User feedback for actions

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, creating sessions stored in PostgreSQL
2. **Restaurant Browsing**: Frontend fetches restaurant data from `/api/restaurants` endpoint
3. **Menu Viewing**: Restaurant details and menu items loaded from `/api/restaurants/:id`
4. **Cart Management**: Cart operations (add/update/remove) sync with backend storage
5. **Order Placement**: Checkout process validates data and creates orders with email notifications
6. **Order Tracking**: Real-time order status updates through polling or WebSocket connections

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **State Management**: TanStack Query for server state
- **UI Components**: Radix UI primitives, Lucide React icons
- **Form Handling**: React Hook Form, Hookform Resolvers
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Utilities**: date-fns, clsx for conditional styling

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript support
- **Database**: Drizzle ORM, Neon PostgreSQL driver
- **Authentication**: OpenID Client, Passport.js
- **Session Management**: Express Session, Connect PG Simple
- **Email Service**: Nodemailer for transactional emails
- **Utilities**: Memoizee for caching, Zod for validation

### Development Tools
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript support across frontend and backend
- **Development**: tsx for TypeScript execution, Replit-specific plugins

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Drizzle Kit for schema management and migrations

### Production Build
- **Frontend**: Vite production build with optimizations
- **Backend**: esbuild bundle for Node.js deployment
- **Static Assets**: Served from dist/public directory
- **Environment**: Production environment variables for database and auth

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL
- **Authentication**: Replit Auth configuration
- **Email Service**: SMTP configuration for email delivery
- **Session Security**: Secure session configuration with httpOnly cookies

## Changelog

- July 02, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.