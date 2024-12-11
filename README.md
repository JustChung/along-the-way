# along-the-way
A web app to find destinations (restaurants) along a route. Enter a starting point and a destination and it will find a route with recommended restaurants in between. Additional features: more route filtering options, user authentication, ai chatbot, saved routes, and saved chats.

Possible Routes: City to City, State to State, Cross Country (multiple states road trip), overseas (routes within a foreign country). As long as the source and destination are valid.

# Credits:
Project Manager: Justin C.

Developer: Lokaranjan M.

Developer: Carter P.

Business Analyst/QA: Michael L. 

## Getting Started

### Prerequisites (Required)

- [Node.js](https://nodejs.org/en/)
- GOOGLE_GEMINI_API_KEY
- GOOGLE_MAPS_API_KEY
- Google Firebase secrets

In Google Cloud Console: Create a new project:
Select the following APIs and enable them for your project.
- Directions API
- Places API (NEW)
- Places API
- Maps Embedded API
- Maps JavaScript API
- Geocoding API
- Gemini API

### Prerequisites (Optional)
- Yelp API key
- Trip Advisor API key

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
5. Run the development server
    ```bash
    npm run dev
    ```
