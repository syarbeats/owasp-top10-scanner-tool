# OWASP Top Ten Scanner Dashboard

A web-based dashboard for visualizing and tracking OWASP Top Ten vulnerabilities detected by the OWASP Scanner.

## Features

- **Project Management**: Create and manage projects for scanning
- **Scan History**: View scan history and track vulnerabilities over time
- **Vulnerability Management**: Track, assign, and update vulnerability status
- **Visualization**: Interactive charts and graphs for vulnerability analysis
- **Team Collaboration**: Invite team members to collaborate on projects
- **API Integration**: Seamless integration with the OWASP Scanner CLI tool

## Architecture

The dashboard is built using the MERN stack:

- **MongoDB**: NoSQL database for storing scan results and user data
- **Express**: Backend API server
- **React**: Frontend user interface
- **Node.js**: JavaScript runtime environment

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- OWASP Scanner CLI tool

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/owasp-scanner/owasp-scanner.git
   cd owasp-scanner/dashboard
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Configure environment variables:
   ```bash
   cp server/.env.example server/.env
   ```
   Edit the `.env` file to set your MongoDB connection string and JWT secret.

4. Start the development server:
   ```bash
   npm start
   ```

5. Access the dashboard at http://localhost:3000

### CLI Integration

To integrate the CLI scanner with the dashboard:

1. Run the scanner with the `init` command to set up the dashboard connection:
   ```bash
   owasp-scanner init
   ```

2. Follow the prompts to configure the dashboard URL, login credentials, and project selection.

3. Run scans with dashboard integration:
   ```bash
   owasp-scanner scan /path/to/project
   ```

## Dashboard Usage

### User Management

- **Registration**: Create a new account with email and password
- **Login**: Authenticate with your credentials
- **Profile**: Update your profile information

### Project Management

- **Create Project**: Create a new project for scanning
- **Project Details**: View project details and scan history
- **Team Management**: Invite team members to collaborate on projects

### Vulnerability Management

- **View Vulnerabilities**: Browse vulnerabilities by project or scan
- **Filter and Search**: Filter vulnerabilities by category, severity, or status
- **Update Status**: Mark vulnerabilities as fixed, false positive, or ignored
- **Assign Vulnerabilities**: Assign vulnerabilities to team members

### Visualization

- **Dashboard Overview**: View summary statistics and trends
- **Category Distribution**: Analyze vulnerabilities by OWASP Top Ten category
- **Severity Distribution**: Analyze vulnerabilities by severity level
- **Trend Analysis**: Track vulnerability trends over time

## API Documentation

The dashboard provides a RESTful API for integration with the CLI scanner and other tools.

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get JWT token
- `GET /api/auth/profile`: Get current user profile

### Projects

- `GET /api/projects`: List all projects for current user
- `POST /api/projects`: Create a new project
- `GET /api/projects/:id`: Get project details
- `PUT /api/projects/:id`: Update project
- `DELETE /api/projects/:id`: Delete project
- `POST /api/projects/:id/team`: Add user to project team

### Scans

- `GET /api/projects/:id/scans`: List all scans for a project
- `POST /api/scans`: Create a new scan (used by CLI scanner)
- `GET /api/scans/:id`: Get scan details
- `DELETE /api/scans/:id`: Delete scan

### Vulnerabilities

- `GET /api/scans/:id/vulnerabilities`: List all vulnerabilities for a scan
- `GET /api/projects/:id/vulnerabilities`: List all vulnerabilities for a project
- `PUT /api/vulnerabilities/:id`: Update vulnerability status
- `GET /api/vulnerabilities/stats`: Get vulnerability statistics

## License

MIT