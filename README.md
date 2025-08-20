
# Recipe Share

Recipe Share is a full-stack web application that allows users to search for, create, and share their favorite recipes. Users can browse recipes, view details, and contribute their own creations to the community.

## Features
- User authentication (sign up, login)
- Search for recipes
- Add new recipes
- View recipe details
- Responsive design

## Tech Stack
- **Frontend:** React (client/)
- **Backend:** Node.js, Express (server/)
- **Database:** MongoDB

## Getting Started

### Prerequisites
- Node.js (v14 or above)
- npm or yarn
- MongoDB instance (local or cloud)

### Installation
1. **Clone the repository:**
	 ```bash
	 git clone https://github.com/shrutikarne/recipe-share.git
	 cd recipe-share
	 ```
2. **Install dependencies:**
	 - For the client:
		 ```bash
		 cd client
		 npm install
		 ```
	 - For the server:
		 ```bash
		 cd ../server
		 npm install
		 ```

3. **Configure environment variables:**
	 - Create a `.env` file in the `server/` directory with your MongoDB URI and any other secrets.

4. **Run the application:**
	 - Start the backend server:
		 ```bash
		 cd server
		 npm start
		 ```
	 - Start the frontend React app:
		 ```bash
		 cd ../client
		 npm start
		 ```

## Folder Structure
```
recipe-share/
├── client/         # React frontend
├── server/         # Node.js/Express backend
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the MIT License.
