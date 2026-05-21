# Lavage de Mahdi - Loyalty Card App

A React Native + Firebase loyalty card management app for car wash businesses. It tracks customer washes, awards a free wash after every 5 paid washes, and keeps working offline with a queue that syncs when connectivity returns.

## Features

- QR code-based card scanning and assignment
- Automatic free wash rewards every 5 paid washes
- Offline sync with an AsyncStorage queue
- Real-time Firestore sync
- Customer list with search
- Export/backup functionality

## Tech Stack

- React Native + Expo SDK 54
- Firebase Firestore
- React Native QR Code SVG
- Offline queue with NetInfo

## Setup

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file from `.env.example`
4. Put your Firebase config values in `.env`
5. Run `npx expo start --android` or `eas build --platform android --profile preview`

## Deployment

Uses EAS Build and EAS Update for OTA updates. Update `eas.json` with your Expo account.

## Lessons Learned

- Free wash logic must track washes since the last free wash, not modulo on total washes, to avoid edge cases
- Use `setDoc()` for full overwrites, not `updateDoc()`, when resetting documents
- Firestore has no built-in point-in-time recovery, so export/backup early

## License

MIT
