# Along The Way

A web app to find destinations (restaurants) along a route. Enter a starting point and a destination and it will find a route with recommended restaurants in between. Additional features: more route filtering options (detour time, maximum number of stops, minimum star rating), user authentication, ai chatbot, saved routes, and saved chats.

## Route Types
Possible Routes: City to City, State to State, Cross-Country (a road trip through multiple states), and overseas (routes within a foreign country), as long as the source and destination are valid.

## Credits
- **Project Manager:** Justin C.
- **Developer:** Lokaranjan M.
- **Developer:** Carter P.
- **Business Analyst/QA:** Michael L.

## Detailed Features

### Core Features
- **Interactive Route Planning**:
  - Real-time route visualization on Google Maps
  - Restaurant markers color-coded by detour time
  - Detailed restaurant information windows
  
- **Smart Filtering**:
  - Maximum detour time in minutes
  - Minimum star rating (1-5 stars)
  - Number of stops
  - Toggle detour consideration

- **Restaurant Details**:
  - Ratings and reviews from multiple sources
  - Business hours and contact information
  - Facilities information (outdoor seating, wheelchair access, etc.)
  - Photos (when available)
  - Price level indicators
  - Distance and detour time calculations

- **AI Chatbot Assistant**:
  - Natural language route planning
  - Restaurant recommendations
  - Saved chat history
  - Context-aware responses

## Tech Stack
* React.js
* Node.js
* Material Tailwind
* Google Firebase

## Getting Started

### Prerequisites (Required)
* Node.js
* GOOGLE_GEMINI_API_KEY
* GOOGLE_MAPS_API_KEY
* Google Firebase secrets

Note: Some API keys may expire after the free trial or have limits.

In Google Cloud Console: Create a new project: Select all of the following APIs and enable them for your project.
* Directions API
* Places API (NEW)
* Places API
* Maps Embedded API
* Maps JavaScript API
* Geocoding API
* Gemini API

### Prerequisites (Optional)
* Yelp API key
* Trip Advisor API key

### Installation

1. Clone the repo
```bash
git clone https://github.com/JustChung/along-the-way.git
cd into the UI folder
```

2. Install NPM packages
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add the following:
```env
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
VITE_REACT_APP_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
VITE_REACT_APP_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VITE_REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
VITE_REACT_APP_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
VITE_REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
VITE_TRIPADVISOR_API_KEY=YOUR_TRIPADVISOR_API_KEY
VITE_YELP_API_KEY=YOUR_YELP_API_KEY 
```

4. Ensure that your Firebase project is set up correctly for a web app. Enable user authentication and cloud firestore.
5. Run the development server. The app will run on a local host in your web browser ie: http://localhost:5173/
```bash
npm run dev
```

## Implementation Details

### Restaurant Search
- Segments route into optimal sections based on total distance
- Fetches restaurants along each segment using Places API
- Calculates detour times using Distance Matrix API
- Filters results based on user preferences
- Distributes stops evenly along the route when maximum stops is specified

### Data Storage
- Routes are automatically saved for logged-in users
- Chat histories are preserved and linked to routes
- User preferences and settings are stored in Firestore

### Review System
- Primary reviews from Google Places API
- Optional integration with Yelp and TripAdvisor
- Review aggregation and sorting by date
- Rating and review count display

## Important Notes
- The application requires a valid Google Maps API key with billing enabled
- Restaurant data is fetched from the Google Places API and has usage quotas
- The chatbot uses the Google Gemini API which has rate limits
- Review aggregation from Yelp and TripAdvisor is optional and requires additional API keys
- Firebase has its own quotas and limits on the free tier

## Security Features
- Secure API key storage using environment variables
- Firebase Authentication for user management
- Firestore security rules for data access
- Input validation and sanitization

# Demo Screenshots
## Main App (Before using it)
![Main App](https://i.ibb.co/87jy31f/image.png)

# User Authentication
Login Page, Signup Page, Successful Login animation)
![Login Page](https://github.com/user-attachments/assets/4b7b32b2-4c7c-4bf1-a935-4e691a6967ea)
![Signup Page](https://github.com/user-attachments/assets/876d37d7-b9eb-488e-bb6e-b742c5fd0485)
![Successful Login](https://github.com/user-attachments/assets/6cf35726-7478-4f62-92ce-64f10c1a4fb3)

## Main App (Search route with no filters on, as well as a Chatbot conversation example.)
![No Filters Search](https://github.com/user-attachments/assets/e09acbe2-8258-4463-8a4d-d307da228472)

Click each restaurant to view more details such as ratings, reviews, contact info, etc)
![View each restaurant's details](https://i.ibb.co/MMVRR8v/image.png)

## Main App (Search route with filters applied, as well as a Chatbot conversation example)
![Filtered Search Results](https://i.ibb.co/fkKVwqF/image.png)

# Features Requiring an Account to Access (Signup is free)

## Account Details Page
(Features: Change password, resend verification email, and delete account)
![Accounts Page](https://github.com/user-attachments/assets/5ca40945-5b82-4596-bb34-a16e99c59ebe)

## Saved Routes Page
View all your saved routes and restaurants found on each route.
![Saved Routes](https://i.ibb.co/3rCqHBr/image.png)
![Restaurants on your saved route](https://i.ibb.co/n35qgvK/image.png)

## Saved Chats Page
View all your saved chatbot history conversations.
![Saved Chats](https://i.ibb.co/88zdk67/image.png)
![Chats based on your saved route and results](https://i.ibb.co/pJRxJsp/image.png)


