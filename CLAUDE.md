# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React application bootstrapped with Create React App. It uses React 19 with a standard Create React App structure and configuration.

## Development Commands

### Starting Development Server
```bash
npm start
```
Runs the app in development mode at http://localhost:3000 with hot reload.

### Running Tests
```bash
npm test
```
Launches the test runner in interactive watch mode using Jest and React Testing Library.

### Building for Production
```bash
npm run build
```
Creates an optimized production build in the `build` folder.

### Linting
The project uses ESLint with the `react-app` configuration. Linting is integrated into the development server and will show errors in the console.

## Project Structure

```
src/
├── App.js          # Main App component
├── App.css         # App component styles
├── App.test.js     # App component tests
├── index.js        # React app entry point
├── index.css       # Global styles
├── setupTests.js   # Jest test setup
├── reportWebVitals.js # Performance monitoring
└── logo.svg        # App logo asset
└── components.     #components on dashboard
└── data
└── context
└── auth
└── common
└── layout
└── pages
└── firebase
└── style


```


## Testing Framework

- **Jest**: Test runner (configured via react-scripts)
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers
- **@testing-library/user-event**: User interaction testing

Test files should be named `*.test.js` or `*.spec.js` and placed alongside the components they test.

## Key Dependencies

- React 19.1.0
- React DOM 19.1.0
- React Scripts 5.0.1 (handles build tooling)
- Web Vitals for performance monitoring
- firebase auth
- firebase firestore
- cloud firestore
- firebase storage

## Architecture Notes

This is a standard Create React App setup with:
- Single Page Application (SPA) architecture
- Component-based React structure
- Built-in Webpack configuration via react-scripts
- ESLint configuration for code quality
- Jest and React Testing Library for testing
- with the multiple routes
- login and signup and auth
- profile system 
- follow , friend request , messsage to the profile 


## firebase
- firebase databse
- firebase authenication
- firebase storage
- cloud firestore