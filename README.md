# AI Job Application Tracker

A full-stack job application tracking system with SQLite database, Express backend, Next.js frontend, and Motia workflow integration.

## 🚀 Project Overview

**AI Job Application Tracker** is a comprehensive solution for managing job applications with built-in analytics and workflow automation. Designed for hackathons and interviews, this project demonstrates:

- **Full-stack development** with Node.js backend and Next.js frontend
- **Event-driven architecture** using Node.js EventEmitter
- **Workflow automation** with Motia integration
- **Data analytics** with comprehensive insights generation
- **Email notifications** with nodemailer integration
- **Clean, maintainable code** with proper separation of concerns

## 📐 Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                AI Job Application Tracker                        │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │    Frontend     │    │    Backend      │    │    Database     │          │
│  │  (Next.js)      │◄──►│  (Express)     │◄──►│  (SQLite)       │          │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘          │
│          ▲                          ▲                                      │
│          │                          │                                      │
│  ┌───────┴───────┐          ┌───────┴───────┐                              │
│  │    User       │          │    Motia      │                              │
│  │  Interface    │          │  Workflows    │                              │
│  └───────┬───────┘          └───────┬───────┘                              │
│          │                          │                                      │
│  ┌───────▼───────┐          ┌───────▼───────┐                              │
│  │  Dashboard    │          │  Event        │                              │
│  │  Components   │          │  System       │                              │
│  └───────────────┘          └───────────────┘                              │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## 🔧 How Motia is Used

Motia workflows are integrated throughout the application to provide automation and insights:

### 1. **Application Created Workflow**
- **Trigger**: When a new job application is created (POST /applications)
- **Actions**:
  - Logs detailed application information to console
  - Captures timestamp, company, role, and other metadata
  - Provides immediate feedback on application submission

### 2. **Status Updated Workflow**
- **Trigger**: When an application status changes (PATCH /applications/:id/status)
- **Actions**:
  - Calculates response time from application to status change
  - Queries SQLite database for application details
  - Logs status transition with timing information

### 3. **Weekly Summary Workflow**
- **Trigger**: Manual call or scheduled execution
- **Actions**:
  - Generates comprehensive statistics from SQLite
  - Calculates rejection rates by source
  - Identifies best performing resume versions
  - Computes average response times
  - Sends email summary or logs to console

### Event-Driven Integration
```javascript
// Event listeners in routes/applications.js
eventEmitter.on('application_created', async (applicationData) => {
  await applicationCreatedWorkflow(applicationData);
});

eventEmitter.on('status_updated', async (statusUpdateData) => {
  await statusUpdatedWorkflow(statusUpdateData.applicationId, statusUpdateData.oldStatus, statusUpdateData.newStatus);
});
```

## 🔧 Motia Workflows in Detail

Motia serves as the event-driven orchestration layer that powers the AI Job Tracker's automation capabilities. By separating workflow logic from core business operations, Motia enables clean architecture and easy extensibility.

### Motia Events Overview

The application uses three primary Motia events:

#### Event: application_created
**Workflow:**
- Motia receives event from backend when new application is created
- Stores timestamp and metadata in workflow context
- Updates analytics counters for application sources
- Triggers insight recalculation for real-time statistics
- Logs detailed application information to console
- Prepares data for status tracking and response time calculation

#### Event: application_status_updated
**Workflow:**
- Motia receives event when application status changes
- Retrieves original application data from SQLite database
- Calculates response time from application to status change
- Updates status transition history
- Logs detailed status change information with timing
- Triggers recalculation of average response times
- Updates rejection rate statistics if applicable

#### Event: weekly_summary_triggered
**Workflow:**
- Motia receives manual or scheduled trigger
- Queries SQLite database for all application data
- Generates comprehensive statistics and insights
- Calculates rejection rates by application source
- Identifies best performing resume version
- Computes average response times across all applications
- Formats summary report with actionable insights
- Sends email notification or logs to console

### Workflow Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                            AI Job Tracker with Motia                           │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │    Frontend     │    │    Backend      │    │    Motia        │          │
│  │  (Next.js)      │───►│  (Express)     │───►│  Workflows      │          │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘          │
│          ▲                          ▲                                      │
│          │                          │                                      │
│  ┌───────┴───────┐          ┌───────┴───────┐                              │
│  │    User       │          │    SQLite     │                              │
│  │  Interface    │          │  Database     │                              │
│  └───────┬───────┘          └───────┬───────┘                              │
│          │                          │                                      │
│  ┌───────▼───────┐          ┌───────▼───────┐                              │
│  │  Dashboard    │          │  Insights     │                              │
│  │  Components   │          │  Generation   │                              │
│  └───────────────┘          └───────────────┘                              │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Why Motia Matters

**Clean Separation of Concerns**
- Motia workflows are completely decoupled from core business logic
- Event-driven architecture allows independent scaling of components
- Workflow changes don't require modifications to API routes or database

**Easy Extensibility**
- New workflows can be added without changing existing code
- Simple event emission pattern makes integration straightforward
- Workflow logic is isolated and easy to test

**Real-World Backend Relevance**
- Demonstrates enterprise-grade event-driven architecture
- Shows understanding of workflow automation patterns
- Provides practical experience with orchestration layers


## 🏃 How to Run the Application

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- SQLite (included with better-sqlite3)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-job-tracker.git
   cd ai-job-tracker
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   - The backend will run on `http://localhost:3001`
   - SQLite database will be automatically created
   - All API endpoints will be available

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   - The frontend will run on `http://localhost:3000`
   - Open this URL in your browser

### Environment Variables (Optional)

For email functionality, create a `.env` file in the backend directory:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SERVICE=gmail
```

## 🎬 Demo Flow for Judges

### 1. **Application Setup (1-2 minutes)**
- Show the project structure and explain the architecture
- Demonstrate the clean code organization
- Highlight key files: `backend/routes/applications.js`, `backend/motia/workflows.js`, `frontend/components/Dashboard.js`

### 2. **Backend API Demonstration (3-4 minutes)**
- Show POSTMAN or curl examples of API endpoints:
  ```bash
  # Create application
  curl -X POST http://localhost:3001/api/applications \
    -H "Content-Type: application/json" \
    -d '{"company":"Tech Corp","role":"Software Engineer"}'

  # Update status
  curl -X PATCH http://localhost:3001/api/applications/1/status \
    -H "Content-Type: application/json" \
    -d '{"status":"Interview"}'

  # Get insights
  curl http://localhost:3001/api/insights
  ```
- Show console output from Motia workflows
- Demonstrate event emission and workflow execution

### 3. **Frontend Dashboard (2-3 minutes)**
- Show the clean, minimal dashboard interface
- Demonstrate application listing with status updates
- Show status counts and insights display
- Highlight the responsive design

### 4. **Motia Workflow Demonstration (3-4 minutes)**
- Trigger application_created workflow by creating a new application
- Show the detailed console output with timestamps
- Update an application status to trigger status_updated workflow
- Run weekly summary workflow:
  ```bash
  node -e "const {weeklySummaryWorkflow} = require('./backend/motia/workflows'); weeklySummaryWorkflow('judge@example.com');"
  ```
- Show email sending or console logging based on configuration

### 5. **Insights and Analytics (2-3 minutes)**
- Show the comprehensive insights generation
- Explain the three types of insights:
  - Rejection rate by source
  - Best performing resume version
  - Average response time
- Demonstrate how insights help improve job search strategy

### 6. **Code Quality Highlights (2-3 minutes)**
- Show clean, readable code with comments
- Demonstrate proper error handling
- Highlight event-driven architecture
- Show SQLite integration with better-sqlite3
- Explain the separation of concerns

### 7. **Future Enhancements Discussion (1-2 minutes)**
- Discuss potential additions:
  - User authentication
  - Scheduled email reports
  - Advanced analytics with charts
  - AI-powered resume suggestions
- Explain how the current architecture supports these enhancements

## 📂 Project Structure

```
ai-job-tracker/
├── backend/
│   ├── index.js              # Main Express server
│   ├── routes/
│   │   └── applications.js   # Application API routes with event emission
│   ├── db/
│   │   ├── db.js             # SQLite database operations
│   │   └── applications.db   # SQLite database file
│   ├── motia/
│   │   └── workflows.js      # Motia workflow integration
│   ├── services/
│   │   ├── insightService.js  # Analytics and insights
│   │   └── emailService.js    # Email notifications
│   ├── package.json          # Backend dependencies
│
├── frontend/
│   ├── app/
│   │   └── page.js           # Main Next.js page
│   ├── components/
│   │   └── Dashboard.js      # Dashboard UI component
│   ├── package.json          # Frontend dependencies
│
└── README.md                 # Project documentation
```

## 🔧 Backend API Endpoints

### Applications
- **GET** `/api/applications` - Get all job applications
- **GET** `/api/applications/:id` - Get single application
- **POST** `/api/applications` - Create new application
- **PATCH** `/api/applications/:id/status` - Update status
- **PUT** `/api/applications/:id` - Full update
- **DELETE** `/api/applications/:id` - Delete application

### Insights
- **GET** `/api/insights` - Get comprehensive insights

## 🛠 Technologies Used

### Backend
- **Node.js** with **Express**
- **better-sqlite3** for SQLite database
- **CORS** middleware
- **Motia** for workflow automation
- **nodemailer** for email notifications
- **EventEmitter** for event handling

### Frontend
- **Next.js** (App Router)
- **React** with hooks
- **Fetch API** for backend communication

## 📝 Development Notes

### Backend
- Uses **better-sqlite3** for efficient SQLite operations
- Plain SQL queries with prepared statements
- Event emission for application lifecycle events
- Proper error handling and logging

### Frontend
- Client-side data fetching with React hooks
- Real-time status updates
- Responsive layout with minimal styling
- Clean, simple UI focused on core functionality

## 🔮 Future Enhancements

While this implementation focuses on core functionality, potential future additions could include:
- User authentication and authorization
- Scheduled weekly email reports
- Advanced analytics with charts and visualizations
- AI-powered insights (via Motia integration)
- Resume version management and suggestions
- Application source tracking and recommendations

## 📝 Resume-Ready Project Description

Perfect for showcasing your skills in hackathons, interviews, or your resume:

- **Designed an event-driven job application tracker using Motia workflows** to automate analytics and insight generation
- **Implemented Motia-powered event-driven architecture** that separates workflow logic from core business operations
- **Built comprehensive automation workflows** for application tracking, status updates, and weekly summary generation
- **Created real-time analytics dashboard** with Motia-triggered insights including rejection rates, response times, and resume performance

## 📋 Resume Bullet Points

Copy-paste ready bullet points for your resume:

- **Designed and implemented an event-driven job application tracker** using Motia workflows to automate analytics and insight generation
- **Orchestrated Motia-powered workflow automation** for application lifecycle events including creation, status updates, and weekly summaries
- **Built a comprehensive event-driven architecture** using Motia that demonstrates clean separation of concerns and enterprise-grade backend patterns
- **Automated job search analytics** with Motia workflows that calculate rejection rates, response times, and resume performance metrics

## 🚀 Future Improvements

- Email notifications for weekly summaries and important application status changes (email will be added)
- Integration with additional communication channels such as Slack or WhatsApp
- AI-driven resume performance recommendations
- Long-term job application trend analysis

## 👤 Author

- Swapnil Nicolson Dadel
- Built as part of a Backend hackathon
- Focused on event-driven workflows and backend automation
