# 📚 BookNook – Your Cozy Reading Corner

**BookNook** is a small online library application where users can explore books, add their own books, and manage borrowing and returning activities. It provides a simple and responsive experience for book lovers.

🌐 **Live Website:** https://booknook-client-1ahf.vercel.app/

🖥️ **Frontend Repository:** https://github.com/fuadcodesDev/booknook-client

⚙️ **Backend Repository:** https://github.com/fuadcodesDev/booknook-server

## ✨ Features

- **Browse Books:** Explore the available book collection and search by title or author.
- **Category Filtering:** Filter books by Fiction, Science, History, Kids, and Others.
- **User Authentication:** Register and log in using email and password or Google authentication.
- **Add Books:** Logged-in users can add books with cover images and descriptions.
- **Manage Your Books:** View, edit, and delete books you have added.
- **Borrow Books:** Borrow available books and manage your borrowing records.
- **Return Books:** Return borrowed books and automatically update available copies.
- **Responsive Design:** Enjoy the application on desktop, tablet, and mobile devices.
- **Protected Routes:** Restrict private pages and operations to authenticated users.

## 🛠️ Technologies Used

### Frontend
- Next.js
- React
- Tailwind CSS
- Better Auth
- Swiper
- Lucide React

### Backend and Services
- Node.js
- Express.js
- MongoDB Atlas
- Better Auth JWT verification
- ImgBB Image Hosting
- Render
- Vercel

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/fuadcodesDev/booknook-client.git
```

### 2. Navigate to the project directory

```bash
cd booknook-client
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the project root and add:

```env
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:5001
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Replace the placeholder values with your own credentials. Never commit your environment files or expose secret keys.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

**Note:** The backend server must also be running for book and borrowing features to work. Follow the setup instructions in the [BookNook Server Repository](https://github.com/fuadcodesDev/booknook-server).

## 👨‍💻 Author

**Fuad Chowdhury Safwan**

GitHub: [@fuadcodesDev](https://github.com/fuadcodesDev)