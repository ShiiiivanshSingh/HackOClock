# wellness habit tracker

mobile app to monitor and improve daily wellness habits through tracking, reminders and visualization.

## features

- **user onboarding**: firebase auth with email/google login
- **google fit integration**: auto-fetch sleep and exercise data
- **manual logging**: water intake and stress/mood tracking
- **personalized reminders**: smart notifications for water, breaks, and sleep
- **dashboard**: visualize daily progress and weekly trends
- **settings**: customize goals and notification preferences

## tech stack

- **frontend**: react native, expo, react navigation
- **state management**: context api / redux
- **backend**: firebase (auth + firestore)
- **local storage**: asyncstorage / sqlite
- **apis**: google fit rest api
- **notifications**: expo notifications / fcm
- **visualization**: victory native / recharts

## setup

1. install dependencies:
   ```bash
   npm install
   ```

2. create firebase project and add config to `.env` file:
   ```
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-storage-bucket
   FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   FIREBASE_APP_ID=your-app-id
   ```

3. set up google fit api credentials in google cloud console

4. start development server:
   ```bash
   npx expo start
   ```

## development roadmap

1. user authentication
2. google fit integration
3. manual data logging
4. notification system
5. dashboard and visualization
6. settings and preferences

## folder structure

```
/app                    # expo router app directory
  /_layout.js           # root layout
  /index.js             # home screen/dashboard
  /auth/                # authentication screens
  /tracking/            # logging screens
  /stats/               # visualization screens
  /settings/            # user preferences
/components/            # reusable components
/hooks/                 # custom hooks
/services/              # api services
/utils/                 # helper functions
/contexts/              # state management
```

supports un sustainable development goal 3: good health and well-being
