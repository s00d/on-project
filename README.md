# On-Project

On-Project is a comprehensive project management web application designed to facilitate team collaboration and efficient task management. This application supports the entire project lifecycle, from planning and task creation to tracking progress and generating reports. On-Project is flexible, extensible, and features an intuitive user interface, making it ideal for both small teams and large organizations.

## Features

### 1. Project Management
- **Create, Edit, and Delete Projects**: Manage your projects with ease, including archiving and restoring access to archived projects.
- **User Management**: Invite users to projects, assign roles, and manage access permissions.
- **Project Archiving**: Archive and unarchive projects as needed.

### 2. Task Management
- **Kanban Board**: Visualize project tasks using a Kanban board with drag-and-drop functionality.
- **Task Creation and Editing**: Create, edit, and delete tasks, with options to attach files and set priorities.
- **Task Templates**: Use task templates for quick and standardized task setup.
- **Advanced Filtering and Sorting**: Filter and sort tasks by status, priority, tags, due dates, assignees, and more.

### 3. Roadmap and Sprint Management
- **Roadmaps**: Plan long-term project goals with customizable roadmaps.
- **Sprint Management**: Define and manage sprints within roadmaps, including task assignments and timelines.
- **Sprint Visualization**: View sprint progress on a timeline to keep track of milestones and deadlines.

### 4. Document Management
- **File Attachments**: Upload and manage documents related to projects and tasks.
- **Comment Attachments**: Attach files directly in task comments for easier collaboration.

### 5. Notifications and Comments
- **Task Comments**: Add comments to tasks, with support for file attachments.
- **Notifications**: Receive notifications for task updates, with options to mark notifications as read or unread.

### 6. Reporting and Analytics
- **Custom Reports**: Generate reports on task priorities, team performance, workload distribution, and project progress.
- **Data Export and Import**: Export and import project data, with GitHub integration for task import.
- **Visual Analytics**: Visualize project data through graphs and charts for better decision-making.

### 7. Tag and Template Management
- **Tag Management**: Create and manage tags for organizing and filtering tasks.
- **Template Management**: Create and apply task and project templates for standardized processes.

### 8. Security and Access Management
- **Authentication and Authorization**: Manage user authentication with JWT and API keys, and control access based on user roles.
- **Two-Factor Authentication**: Enhance security with two-factor authentication for user accounts.

## Technology Stack

### Frontend
- **Vue.js**: Frontend framework with TypeScript for building a responsive and dynamic user interface.
- **Vue Router**: For handling navigation and routing within the application.
- **Pinia**: State management library for Vue.js.
- **Bootstrap**: For responsive UI design.
- **Chart.js**: For visualizing data in reports and analytics.
- **Socket.io Client**: For real-time updates and communication between the client and server.

### Backend
- **Node.js with Express**: Backend framework using TypeScript for building the REST API.
- **TypeORM**: ORM for managing database interactions.
- **GraphQL**: API query language for flexible data retrieval.
- **Socket.io**: For real-time event handling and updates.
- **PostgreSQL/MySQL/SQLite**: Supported databases for storing project data.
- **Nodemailer**: For sending email notifications.
- **Swagger**: For API documentation.

## Installation and Setup

### Prerequisites
- Node.js (v20+)
- npm package manager

### Step 1: Clone the repository
```bash
git clone https://github.com/s00d/on-project.git
cd on-project
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Create a `.env` file in both `frontend` and `backend` directories, and configure your environment variables (e.g., database connection details, API keys).

### Step 4: Run the Application
To start both the frontend and backend servers simultaneously:
```bash
npm run dev
```

Alternatively, you can run the frontend and backend separately:
```bash
# Start frontend
npm run frontend

# Start backend
npm run backend
```

### Step 5: Build for Production
To build the application for production:
```bash
npm run build
```

### Step 6: Start the Application in Production Mode
After building, start the application:
```bash
npm start
```

## Scripts

### General Scripts
- **`npm run dev`**: Runs both frontend and backend in development mode concurrently.
- **`npm run build`**: Builds both frontend and backend for production.
- **`npm start`**: Starts the backend server for production.

### Frontend Scripts
- **`npm run frontend`**: Runs the frontend development server.
- **`npm run frontend:build`**: Builds the frontend for production.
- **`npm run frontend:format`**: Formats the frontend code using Prettier.
- **`npm run frontend:lint`**: Lints the frontend code using ESLint.

### Backend Scripts
- **`npm run backend`**: Runs the backend development server with hot-reloading.
- **`npm run backend:build`**: Builds the backend for production.
- **`npm run backend:format`**: Formats the backend code using Prettier.
- **`npm run backend:lint`**: Lints the backend code using ESLint.
- **`npm run backend:migrate`**: Runs database migrations using TypeORM.

## Contributing

Contributions are welcome! Please follow these steps to contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Create a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Contact

For any inquiries or issues, please open an issue on GitHub.

---

This `README.md` provides a comprehensive overview of the On-Project application, its features, the technology stack, and instructions for setup and contribution.
