## How to Run
Make sure you have these installed:
- [Node.js](https://nodejs.org) (v18 or above)
- [Expo Go](https://expo.dev/go) app on your phone
- Must be connected to **school WiFi** (to access the database)


### Install app dependencies
```
npm install
```

### Set up backend server
Install backend dependencies:
```
npm install express mysql2 nodemailer cors dotenv
```

Start the backend server:
```bash
node server.js
```

You should see:

🚀 Server running on http://localhost:3000
✅ MySQL Connected

### Find your Mac/PC local IP address

**Mac:**
```bash
ipconfig getifaddr en0
```

**Windows:**
```bash
ipconfig
```
Look for **IPv4 Address** under your WiFi adapter.

### Update the server URL in the app

Open `App.js` file and find this line:
```javascript
const response = await fetch("http://10.252.2.107:3000/login"
```
Replace `10.252.2.107` with your own IP address.

### Start the app
```bash
npx expo start
```

Scan the QR code with your phone's camera (iOS) or Expo Go (Android).

---

## Role Detection

The app automatically detects the user role based on their school email:

| Email Format | Role |
|---|---|
| `123abc@kl.his.edu.my` | Student |
| `name.surname@kl.his.edu.my` | Staff |

---

## Notification 

| Who | What they receive |
|---|---|
| **Staff** | All student pickup alerts + second round warnings |
| **Student** | Only their own pickup notification |
| **Second round** | Urgent message to hurry to pickup zone |

---

##  Notes
- The backend server must be running for login and notifications to work
- Both your phone and laptop must be on the **same WiFi network**
- The school database is only accessible on **school WiFi**
