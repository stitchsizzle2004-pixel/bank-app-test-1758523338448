# Bank Management System

## Overview

This is a full-stack web application for bank account management built with modern web technologies. The system provides a complete banking interface with account creation, deposit, withdrawal, transfer operations, and real-time dashboard analytics. It features a React frontend with shadcn/ui components and an Express backend with PostgreSQL database integration via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with JSON responses
- **Session Management**: Express sessions with PostgreSQL store
- **Error Handling**: Centralized error middleware with structured responses

### Database Design
- **Primary Database**: PostgreSQL via Neon Database serverless
- **Schema Management**: Drizzle migrations with push-based deployment
- **Tables**: 
  - `accounts` - Bank account information with unique account numbers
  - `transactions` - Financial transaction records with foreign key relationships
- **Data Validation**: Schema validation using drizzle-zod integration

### API Structure
- **Dashboard**: `/api/dashboard/stats` - Aggregated banking statistics
- **Accounts**: CRUD operations for bank accounts with balance management
- **Transactions**: Deposit, withdrawal, and transfer operations with audit trails
- **GitHub Integration**: `/api/deploy-to-github` - Repository deployment functionality

### Authentication & Authorization
- **GitHub OAuth**: Integrated via Replit connectors for repository operations
- **Session-based**: Express sessions for maintaining user state
- **Token Management**: Automatic token refresh for GitHub API operations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless** - PostgreSQL serverless driver for database connectivity
- **drizzle-orm & drizzle-kit** - Type-safe ORM and migration toolkit
- **@tanstack/react-query** - Server state management and caching
- **@hookform/resolvers** - Form validation resolver for React Hook Form
- **zod** - Runtime type validation and schema definition

### UI Component Libraries
- **@radix-ui/react-*** - Comprehensive set of accessible UI primitives
- **lucide-react** - Icon library for consistent iconography
- **class-variance-authority** - Utility for creating component variants
- **tailwindcss** - Utility-first CSS framework

### Development Tools
- **Vite** - Build tool with HMR and optimized bundling
- **TypeScript** - Static type checking and enhanced developer experience
- **@replit/vite-plugin-*** - Replit-specific development enhancements

### GitHub Integration
- **@octokit/rest** - GitHub API client for repository operations
- **connect-pg-simple** - PostgreSQL session store for Express

### Storage Solutions
- **In-Memory Fallback**: Local storage implementation for development
- **PostgreSQL**: Production database via Neon with connection pooling
- **Session Store**: PostgreSQL-backed session storage for user state persistence