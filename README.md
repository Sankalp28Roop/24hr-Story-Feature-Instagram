📸 24-Hour Story Feature (Instagram Clone)

A client-side Instagram-like Story Feature built with ReactJS, HTML, CSS, and JavaScript.
Users can upload, view, and swipe through stories that automatically disappear after 24 hours.
All data is stored in LocalStorage, so it runs completely on the client-side — no backend required.

🚀 Features

➕ Add New Story
Upload an image and it appears as a circular thumbnail.

⏱ 24-Hour Expiry
Each story automatically disappears after 24 hours (checked via timestamps).

▶️ Auto Playback
Stories play for 3 seconds each with a top progress bar.

🔄 Swipe Navigation
Swipe left/right (or use arrows) to move between stories.

💾 LocalStorage Support
Stories persist across refreshes but are deleted after expiry.

📱 Fully Responsive
Works on mobile, tablet, and desktop devices.

🧠 Tech Stack

| Layer            | Technology                                |
| ---------------- | ----------------------------------------- |
| Frontend         | ReactJS (Functional Components, Hooks)    |
| Styling          | CSS3 (Flexbox, Animations, Media Queries) |
| Storage          | LocalStorage (client-side only)           |
| Image Processing | FileReader + Base64 Encoding              |


📦 Installation & Setup

Navigate into the project directory
cd instagram-story-clone

Install dependencies
npm install

Run the development server
npm start

Open the app
http://localhost:3000


🧰 Project Structure
instagram-story-clone/
│
├── public/
│   └── index.html
│
├── src/
│   ├── components/
│   │   ├── StoryList.jsx
│   │   ├── StoryPlayer.jsx
│   │   └── AddStoryButton.jsx
│   │
│   ├── utils/
│   │   └── storage.js
│   │
│   ├── styles/
│   │   ├── App.css
│   │   └── Story.css
│   │
│   ├── App.jsx
│   ├── index.js
│   └── data/
│       └── sampleStories.json
│
└── package.json


⚙️ How It Works

Adding a Story

User clicks the ➕ button.

Image is converted to Base64 and saved in LocalStorage with a timestamp.

Viewing Stories

Clicking on a story starts a 3-second timer.

A progress bar animates across the top.

When complete, the next story plays automatically.

Expiry Check

On load, app checks LocalStorage for expired stories and deletes them.

🧩 Future Enhancements

Add captions and text overlays

Integrate video story support

Add animations (using Framer Motion)

Add multi-user simulation

Implement backend with Firebase or Node.js


📄 License

This project is licensed under the MIT License.
You’re free to use, modify, and distribute it with proper credit.

👨‍💻 Author

Sankalp
📍 IIT M.Tech | Frontend Developer
