# 🎓 Computer Excellence Academy - LMS (Learning Management System)

**India's Premier Free Digital Learning Platform**

A complete production-ready Learning Management System with advanced features for course delivery, student progress tracking, examinations, and payments.

---

## 🔐 Test Credentials

### **👨‍🎓 STUDENT/USER LOGIN**
```
Email:    computerexcellenceacademy@gmail.com
Password: Students@.....
User ID:  6634a89f3e4d5c2a1

Alternative Student Account:
Email:    computerexcellenceacademy@gmail.com
Password: User@123....
```

### **👨‍💼 ADMIN LOGIN**
```
Email:    ............
Password: ........
Admin ID: 5634a89f3e4d5c2a1b
```

### **📚 TEST COURSE ACCESS**
```
Course:   DCA (Diploma in Computer Application)
Batch:    DCA-001-2026
Access:   Immediate after login
```

---

## 📊 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React.js 18+ + Framer Motion + Vite |
| **Styling** | Bootstrap 5 + Custom CSS (Legacy Design) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT (Access + Refresh Token) |
| **Payment Gateway** | Razorpay |
| **Email Service** | Nodemailer + Gmail SMTP |
| **File Upload** | Multer (Local & Cloud) |
| **Real-time** | Socket.io (for notifications) |
| **State Management** | React Hooks + Context API |
| **Icons** | React Icons (FiIcons) |
| **Animations** | Framer Motion |

---

## 📁 Project Structure

```
ComputerExcellanceAcademy/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── pages/                   # All page components
│   │   │   ├── Home.jsx            # Landing page (fully animated)
│   │   │   ├── Course.jsx          # Courses listing
│   │   │   ├── Notes.jsx           # Study materials
│   │   │   ├── Login.jsx           # Student login
│   │   │   ├── Registration.jsx    # Student signup
│   │   │   ├── Dashboard.jsx       # Student dashboard
│   │   │   ├── AboutUs.jsx         # Company info
│   │   │   ├── Support.jsx         # Help & support
│   │   │   └── Admin/              # Admin pages
│   │   │       ├── AdminLogin.jsx
│   │   │       ├── AdminHome.jsx
│   │   │       ├── AdminCourses.jsx
│   │   │       ├── AdminBatches.jsx
│   │   │       ├── AdminNotes.jsx
│   │   │       ├── AdminPayments.jsx
│   │   │       └── ... (more admin pages)
│   │   ├── components/              # Reusable components
│   │   │   ├── MainNavbar.jsx
│   │   │   ├── LegacyFooter.jsx   # Footer with pincode 272131
│   │   │   ├── RouteEffects.jsx   # Page transition effects
│   │   │   ├── SEOHelmet.jsx      # SEO metadata
│   │   │   ├── AIAssistantWidget.jsx
│   │   │   └── ...
│   │   ├── config/
│   │   │   ├── seoConfig.js       # SEO & metadata
│   │   │   ├── pageRankConfig.js  # Page rank algorithm
│   │   │   └── productionConfig.js
│   │   ├── services/               # API calls
│   │   │   ├── publicDataCache.js
│   │   │   └── ...
│   │   └── styles/                 # CSS files
│   ├── vite.config.js
│   └── package.json
│
├── server/                           # Node.js Backend
│   ├── models/                       # Mongoose schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Batch.js
│   │   ├── Content.js
│   │   ├── Note.js
│   │   ├── Examination.js
│   │   ├── ExamAttempted.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   └── ...
│   ├── routes/                       # API routes
│   │   ├── auth.js
│   │   ├── courseRoute.js
│   │   ├── contentRoute.js
│   │   ├── noteRoute.js
│   │   ├── examinationRoute.js
│   │   ├── paymentRoute.js
│   │   ├── adminRoute.js
│   │   └── ...
│   ├── controllers/                  # Business logic
│   │   ├── contentController.js
│   │   ├── progressController.js
│   │   └── ...
│   ├── middlewares/                  # Custom middlewares
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── adminMiddleware.js       # Admin checks
│   │   ├── rateLimiter.js          # Rate limiting
│   │   └── ...
│   ├── utils/                        # Utility functions
│   │   ├── tokenUtils.js
│   │   ├── emailService.js
│   │   ├── redisClient.js
│   │   └── ...
│   └── server.js                     # Entry point
│
├── .gitignore                        # Git ignore (.env files protected)
├── package.json                      # Root dependencies
├── SEO_OPTIMIZATION_GUIDE.md        # SEO deployment guide
├── PRODUCTION_READY_GUIDE.js        # Production checklist
└── README.md                         # This file
```

---

## ✨ FEATURES EXPLAINED LINE BY LINE

### **🏠 PUBLIC FEATURES (No Login Required)**

#### **1. HOMEPAGE** (`/`)
- **Live animated hero section** with cascade fade-in animations
- **Statistics dashboard** showing:
  - ✅ 15,000+ Happy Students (colored icon: Purple)
  - ✅ 24+ Free Courses (colored icon: Amber)
  - ✅ 500+ PDF Notes (colored icon: Cyan)
  - ✅ 10,000+ Queries Resolved (colored icon: Pink)
- **Live reader indicator** - pulsing indicator showing real-time users
- **Browse Course Categories** - 6 featured courses with spring physics hover effects
- **Testimonials carousel** - auto-rotating student reviews with star ratings
- **Review submission form** - interactive 5-star rating system
- **Call-to-action section** - with theme-colored gradient background
- **Fully animated** with Framer Motion for premium feel

#### **2. COURSES PAGE** (`/courses`)
- Browse all available courses with descriptions
- Filter by category or difficulty level
- View course instructors and student count
- **Join batch button** - enroll in live batches
- Course rating and review count
- Prerequisites information
- **Free enrollment** for most courses

#### **3. STUDY MATERIALS/NOTES** (`/notes`)
- Download free PDF study materials
- Organized by course and chapter
- **Search functionality** to find specific topics
- File size and download count display
- Category-wise filtering
- Preview option for some PDFs

#### **4. ABOUT US PAGE** (`/aboutus`)
- Company mission and vision
- Our story and achievements
- Faculty information
- Awards and recognitions
- Why choose CEA
- Social media links

#### **5. SUPPORT/HELP PAGE** (`/support`)
- Contact form for inquiries
- FAQ section with accordion
- **Live chat widget** (optional)
- Email support information
- Phone support details
- Response time guarantees

#### **6. BATCH PREVIEW** (`/batch-preview/:id`)
- Course batch details (schedule, timing)
- Instructor information
- Student reviews for this batch
- Enrollment deadline
- **Enroll button** with pricing

---

### **👨‍🎓 STUDENT/USER FEATURES (Login Required)**

#### **1. USER AUTHENTICATION**

**Registration (`/register`):**
- Full name input
- Email verification (OTP sent to email)
- Password strength indicator
- Phone number (optional)
- Referral code (optional)
- **Auto-login after registration**

**Login (`/login`):**
- Email/Password login
- **"Forgot Password" link**
- Remember me checkbox
- OAuth options (if configured)

**Forgot Password (`/forgot`):**
- Email-based password reset
- OTP verification
- New password set with confirmation

---

#### **2. USER DASHBOARD** (`/user` or `/dashboard`)

**Dashboard Overview:**
- Welcome greeting with user name
- Quick stats showing:
  - ✅ Enrolled courses count
  - ✅ Total learning hours
  - ✅ Completion percentage
  - ✅ Current streak

**My Courses Section:**
- List of enrolled courses
- Progress bar per course (percentage complete)
- **Resume button** to continue learning
- Course completion date
- Certificate status (if completed)

**Recent Activity:**
- Last accessed courses
- Recent quiz attempts
- Recent note uploads
- Notifications feed

---

#### **3. COURSE LEARNING**

**Course Page (`/user/courses/:courseId`):**
- **Chapter-wise content** organized in sidebar
- Video player for video content
- **PDF viewer** for study materials
- Text content display
- **Page transition animations** (smooth route effects)
- **Auto-scroll to top** on page change
- Mark chapters as complete
- Bookmark important sections
- Note-taking feature

**Content Features:**
- Downloaded content can be accessed offline (if implemented)
- Playback speed control for videos
- Full-screen mode
- Subtitle/closed caption toggle
- Quality selection

---

#### **4. MY NOTES SECTION** (`/user/notes`)

**Upload Notes:**
- Upload personal notes as PDF
- Organize by course and chapter
- Add tags for easy search
- Share notes with classmates (notification sent)
- **Download your uploaded notes**

**Study Materials:**
- Access downloaded course materials
- Search across all notes
- Organize in folders
- Starred/Bookmarked notes quick access

---

#### **5. EXAMINATION/QUIZ SYSTEM**

**My Exams (`/user/GetExam`):**
- List of available exams
- Exam duration
- Number of questions
- Passing criteria
- **Take exam button** (opens exam interface)

**During Exam (`/user/MyExam`):**
- Multiple choice questions (MCQ format)
- Timer countdown (red when < 5 minutes)
- Question navigator (jump to any question)
- **Mark for review** feature
- **Submit exam** when done
- **Auto-save** answers every 30 seconds

**Exam Results (`/user/Result`):**
- Score and percentage
- Correct/incorrect/skipped breakdown
- **Performance analysis** chart
- Compare with class average
- Review answers (if teacher enabled)
- Retake exam (if allowed)

---

#### **6. BATCH MANAGEMENT** (`/user/MyBatches`)

**My Batches:**
- List of enrolled batches
- Batch schedule (start date, end date)
- Batch instructor information
- Number of students in batch
- **Join batch session** button
- Batch details/syllabus

**Batch Details (`/user/BatchDetails/:batchId`):**
- Full batch schedule with dates/times
- Live class links (if scheduled)
- Batch announcements
- Class recordings (if available)
- Batch-specific resources
- Classmates list
- Batch-specific messages/forum

**Attendance (`/user/StudentAttendance`):**
- Your attendance record
- Percentage attendance
- Missing classes list
- Attendance report download
- Class-wise attendance

---

#### **7. PROFILE & SETTINGS** (`/user/Profile`)

**Profile Information:**
- First name, Last name
- Email address (read-only)
- Phone number
- Date of birth
- Address
- Profile picture upload

**Account Settings:**
- Change password (`/user/Chanpass`)
- Email update
- Phone update
- Two-factor authentication (if enabled)
- Login history
- **Connected devices** list

**Learning Preferences:**
- Email notification settings
- Course recommendation frequency
- Newsletter opt-in/out
- Privacy settings

---

#### **8. PAYMENTS & BILLING** (`/user/UserPayments`)

**Payment History:**
- List of all transactions
- Date, amount, status
- Course name
- Payment method
- Invoice download

**Enroll in Paid Courses:**
- **Razorpay integration** for secure payments
- Multiple payment methods:
  - ✅ Credit Card
  - ✅ Debit Card
  - ✅ UPI
  - ✅ Net Banking
  - ✅ Wallets
- **EMI options** (if configured)
- Coupon/Promo code application
- Invoice generation
- Receipt download

**Refund Policy:**
- Refund requests (if eligible)
- Refund status tracking
- Original payment method refund
- Processing time information

---

#### **9. LEADERBOARD** (`/user/Leaderboard`)

**Rankings:**
- Top 50 students by score
- Student name and avatar
- Total score/points
- Courses completed
- Streak (consecutive days learning)
- **Your rank highlighted**

**Filters:**
- By course
- By batch
- By month/week
- All-time top performers

---

#### **10. CONTACT/SUPPORT** (`/user/ContactA`)

**Support Ticket:**
- Raise new support ticket
- Subject and description
- Attached files (screenshots, documents)
- Ticket priority level

**My Tickets:**
- Track support tickets
- View ticket status (Open, In Progress, Resolved)
- Messages with support team
- Add additional information
- Ticket resolution time

---

### **👨‍💼 ADMIN/INSTRUCTOR FEATURES (Admin Login Required)**

#### **1. ADMIN LOGIN** (`/adlogin`)
- **Restricted admin access**
- Two-factor authentication (optional)
- Email + password authentication
- Secure token generation

---

#### **2. ADMIN DASHBOARD** (`/admin`)

**Dashboard Overview:**
- Total revenue (this month, this year)
- Total students enrolled
- New enrollments today
- Courses active
- Pending approvals count

**Quick Stats:**
- Revenue chart (monthly trend)
- Enrollment chart
- Course performance chart
- Student activity heatmap

**Recent Activity:**
- New student registrations
- New payments received
- Course approvals pending
- Support tickets pending

---

#### **3. COURSE MANAGEMENT** (`/admin/courses`)

**Create Course:**
- Course title and description
- Course category (DCA, ADCA, Tally, etc.)
- Instructor assignment
- Course duration
- Difficulty level
- Course cover image upload
- Course outcomes/learning points
- Prerequisites

**Edit Course:**
- Update all course details
- Change instructor
- Modify duration
- Update description
- **Publish/Unpublish course**

**Course Analytics:**
- Total enrolled students
- Completion rate
- Average rating
- Reviews count
- Revenue from course

---

#### **4. BATCH MANAGEMENT** (`/admin/batches`)

**Create Batch:**
- Select course
- Batch start date
- Batch end date
- Class schedule (days & times)
- Class link/meeting URL
- **Assign instructor**
- Set batch capacity
- Set batch status (Open/Closed/Full)

**Manage Students:**
- View enrolled students
- Add students manually
- Remove students from batch
- Download student list
- Send batch announcement

**Batch Schedule:**
- View all class schedules
- Record class (if live)
- Upload class recording
- Send class reminder emails
- Track attendance

---

#### **5. CONTENT MANAGEMENT** (`/admin/courses` → Edit Course)

**Add Course Content:**
- Add chapters
- Add lessons under chapters
- **3 content types:**
  - 📹 Video (upload or YouTube link)
  - 📄 PDF/Documents
  - 📝 Text content

**Content Ordering:**
- Drag-drop to reorder chapters
- Drag-drop to reorder lessons
- Set prerequisite lessons
- Lock/Unlock lessons (by date or completion)

**Content Analytics:**
- View per-lesson engagement
- Average time spent per lesson
- Completion rate
- Student performance on lesson

---

#### **6. NOTES/STUDY MATERIAL MANAGEMENT** (`/admin/notes`)

**Upload Study Materials:**
- Create categories (by course/chapter)
- Upload PDF files
- Add notes title
- Write notes description
- Set notes visibility (public/private)
- Add download count limit (optional)

**Manage Materials:**
- Edit notes information
- Delete notes
- View download count
- See who downloaded what

**Collections:**
- Create note collections/bundles
- Bundle multiple notes together
- Give collection a title
- Set collection visibility

---

#### **7. SESSION/BATCH MANAGEMENT** (`/admin/session`)

**Academic Sessions:**
- Create new session (2025-2026)
- Set session start and end date
- Activate/Deactivate session
- View batches in session

---

#### **8. SUBJECT MANAGEMENT** (`/admin/subject`)

**Add Subjects:**
- Subject name (e.g., "Basic Computer")
- Associate with course
- Add subject description
- Upload subject thumbnail

**Manage Subjects:**
- Edit subject information
- Delete subject (if no exams)
- View courses using subject

---

#### **9. QUESTION BANK** (`/admin/questionbank`)

**Create Questions:**
- Question type: MCQ (Multiple Choice)
- Question text
- 4 options (A, B, C, D)
- Mark correct option(s)
- Marks per question
- Difficulty level (Easy, Medium, Hard)
- Tags/Topics

**Organize Questions:**
- By subject
- By difficulty
- By topic
- By course

**Import/Export:**
- Bulk upload questions (CSV/Excel)
- Export question bank as PDF
- Download question backup

---

#### **10. EXAMINATION SETUP** (`/admin/examination`)

**Create Exam:**
- Exam name/title
- Associated subject
- Total marks
- Duration (minutes)
- Passing percentage (e.g., 40% to pass)
- **Add questions** (select from question bank)
- Exam instructions
- Show/Hide answers after exam

**Exam Settings:**
- Negative marking (yes/no)
- Marks per wrong answer
- Shuffle questions (randomize)
- Shuffle options (randomize A,B,C,D)
- **Schedule exam** (date, time, duration)
- Set exam availability (open for how long)

**Conduct Exam:**
- Start exam session
- Monitor students taking exam
- **Pause/Resume exam** if needed
- Stop exam early (if emergency)

---

#### **11. EXAM RESULTS & REPORTS** (`/admin/result`)

**View Results:**
- Student-wise results
- Exam-wise results
- Performance statistics
- Class average, highest, lowest scores

**Results Features:**
- **View each student's answers**
- See which questions they got right/wrong
- Download results as PDF
- Export results as Excel
- Print results

**Result Approval:**
- Approve results (make visible to students)
- Reject results (redo exam)
- Add remarks/feedback
- Add bonus marks (if needed)

---

#### **12. EXAMINEE MANAGEMENT** (`/admin/examinee`)

**Manage Pupils:**
- Create test examinee (for practice)
- Edit examinee information
- View examinee exam history
- Generate roll numbers
- Download examinee list

---

#### **13. PAYMENTS & BILLING** (`/admin/payments`)

**View Payments:**
- All transactions received
- Payment date and amount
- Student name
- Course name
- Payment method
- Payment ID (Razorpay reference)

**Payment Analytics:**
- Total revenue
- Revenue by course
- Revenue by month
- Payment method breakdown
- Refunds processed

**Process Refunds:**
- Initiate refund (refund to payment method)
- Refund amount
- Refund reason
- Approval workflow

---

#### **14. COUPON/DISCOUNT MANAGEMENT** (`/admin/coupons`)

**Create Coupons:**
- Coupon code (e.g., "SAVE50")
- Discount type: Percentage or Flat amount
- Discount value
- **Usage limit:** Per user / Total uses
- Expiration date
- Applicable courses (all or specific)
- Minimum purchase amount

**Manage Coupons:**
- Edit coupon details
- Activate/Deactivate coupon
- View usage statistics
- Delete expired coupons

---

#### **15. REVIEWS & RATINGS** (`/admin/reviews`)

**Review Moderation:**
- List pending reviews (awaiting approval)
- View review content
- View student who wrote review
- **Approve/Reject review**
- Delete inappropriate reviews
- Feature best reviews (star them)

**Rating Analytics:**
- Course average rating
- Student rating count
- Rating distribution (5-star, 4-star, etc.)

---

#### **16. STUDENT ATTENDANCE** (`/admin/AttendanceDashboard`)

**Mark Attendance:**
- Select batch
- Select class date
- Mark students present/absent
- Add remarks (if absent)
- **Save attendance**

**Attendance Reports:**
- Student-wise attendance
- Batch-wise attendance
- Class-wise attendance
- Download attendance sheet (Excel)
- Generate attendance certificate

---

#### **17. ADMIN PROFILE & SETTINGS** (`/admin/Password`)

**Change Password:**
- Old password verification
- New password
- Confirm password
- Password strength indicator

**Admin Permissions:**
- View permissions (read-only, edit, delete)
- See what features you have access to

---

#### **18. CONTACT/QUERIES** (`/admin/Contact`)

**Support Tickets:**
- View all support tickets from students
- Ticket status (Open, In Progress, Resolved)
- Ticket priority (Low, Medium, High)
- **Reply to tickets**
- Mark as resolved
- Download ticket conversation

**Communication:**
- Send bulk announcement to all students
- Send batch-specific announcement
- Schedule announcement (for future)

---

#### **19. ENROLLMENTS** (`/admin/AdminEnrollments`)

**Manage Enrollments:**
- View all student enrollments
- Manually enroll student in course
- Block/Unblock student from course
- View enrollment date
- View enrollment status (Active, Inactive)

---

## 🚀 HOW TO USE THIS APP - COMPLETE WORKFLOW

### **👨‍🎓 STUDENT WORKFLOW**

#### **Step 1: Create Account & Login**
1. Go to homepage (`/`)
2. Click **"Start Learning Free"** button
3. Fill registration form:
   - Name, Email, Password, Phone
   - Agree to terms
4. Verify email (OTP sent)
5. Auto-login and redirect to homepage

#### **Step 2: Explore Courses**
1. Go to **Courses page** (`/courses`)
2. Browse available courses
3. Read course description and reviews
4. Choose a course
5. Click **"Join Batch"** to enroll

#### **Step 3: Start Learning**
1. Go to **Dashboard** → **My Courses**
2. Click **"Resume"** on your course
3. Study chapters in order
4. Mark chapters complete as you progress
5. Download notes for offline study

#### **Step 4: Take Quiz/Exam**
1. Go to **Dashboard** → **My Exams**
2. Select exam to take
3. Read instructions carefully
4. Answer all questions
5. Submit exam
6. View score and analysis

#### **Step 5: Track Progress**
1. Go to **Dashboard**
2. See completion % for each course
3. View your rank on **Leaderboard**
4. Check attendance on **My Batches**

#### **Step 6: Download Certificate** (if course completed)
1. Complete all chapters
2. Pass all exams
3. Certificate auto-generated
4. Download from **My Courses**

---

### **👨‍💼 ADMIN WORKFLOW**

#### **Step 1: Login to Admin Panel**
1. Go to `/adlogin`
2. Enter admin credentials
3. Click login
4. Access admin dashboard

#### **Step 2: Create a Course**
1. Go to **Admin Panel** → **Courses**
2. Click **"Add New Course"**
3. Fill course details:
   - Title, Description, Category
   - Select instructor
   - Set duration, difficulty
4. Click **"Create Course"**

#### **Step 3: Add Course Content**
1. Select the course
2. Go to **"Add Content"**
3. Create chapters:
   - Add chapter name
   - Add lessons under chapter
4. Upload content for each lesson:
   - Upload video OR
   - Upload PDF OR
   - Write text content
5. Save and publish

#### **Step 4: Create Batch**
1. Go to **Batches**
2. Click **"Create Batch"**
3. Fill batch details:
   - Select course
   - Set start/end date
   - Set class schedule (e.g., Mon-Wed-Fri, 7 PM)
   - Set batch capacity
4. Click **"Create"**

#### **Step 5: Create Exam**
1. Go to **Question Bank**
2. Add questions for exam
3. Go to **Examinations**
4. Click **"Create Exam"**
5. Select subject and questions
6. Set passing percentage, duration
7. Schedule exam (date/time)
8. Publish exam

#### **Step 6: Manage Students**
1. Go to **Enrollments**
2. View all enrolled students
3. Manually add students if needed
4. Track their progress
5. Send notifications

#### **Step 7: Review Results** (after exam)
1. Go to **Results**
2. View student answers
3. Check total score
4. Approve/Reject results
5. Send remarks to students

#### **Step 8: Add Study Materials**
1. Go to **Notes**
2. Click **"Upload Notes"**
3. Select category, upload PDF
4. Add title and description
5. Publish for students

---

## 🎨 DESIGN HIGHLIGHTS

### **Animation & Visual Effects**
- ✅ **Framer Motion animations** on homepage (cascade fade-in, spring physics)
- ✅ **Smooth page transitions** on route changes (scroll-to-top animations)
- ✅ **Colored stat icons** with theme colors:
  - Purple (#7c3cf0) for Students
  - Amber (#f59e0b) for Courses
  - Cyan (#06b6d4) for Notes
  - Pink (#ec4899) for Support
- ✅ **Hover effects** on all interactive elements (scale, shadow, color shift)
- ✅ **Pulsing live reader indicator** on hero section

### **SEO Optimization**
- ✅ **Page Rank Algorithm** for search engine optimization
- ✅ **Strategic Internal Linking** (all pages connected optimally)
- ✅ **Breadcrumb Navigation** (improved UX + SEO)
- ✅ **Schema Markup** (Organization, Course, Breadcrumb schemas)
- ✅ **Sitemap XML and JSON** for search engines
- ✅ **robots.txt** for crawler guidance
- ✅ Meta descriptions and keywords optimized

### **Responsive Design**
- ✅ Mobile-first approach
- ✅ Tablet optimization (col-md-* classes)
- ✅ Desktop full-width layout
- ✅ Touch-friendly buttons and forms

---

## 🔒 Security Features

- ✅ **JWT Authentication** (Access + Refresh Tokens)
- ✅ **Password hashing** (Bcrypt)
- ✅ **HTTPS enforcement** in production
- ✅ **Rate limiting** on sensitive endpoints
- ✅ **CORS configuration** for cross-origin requests
- ✅ **SQL/NoSQL injection prevention**
- ✅ **XSS attack prevention**
- ✅ **Environment variables** protected (not in git)

---

## 📦 Installation & Setup

### **Requirements**
- Node.js v16+ 
- MongoDB v4.4+
- npm or yarn

### **Backend Setup**
```bash
cd server
npm install
cp .env.example .env

# Update .env with:
# MONGO_URI=mongodb://localhost:27017/cea
# JWT_SECRET=your_secret_key
# RAZORPAY_KEY_ID=your_key
# RAZORPAY_KEY_SECRET=your_secret
# GMAIL_USER=your_email@gmail.com
# GMAIL_PASS=your_app_password

npm run dev
# Server runs on http://localhost:5000
```

### **Frontend Setup**
```bash
cd client
npm install

# Update .env with:
# VITE_API_URL=http://localhost:5000

npm run dev
# App runs on http://localhost:5173
```

---

## 🌐 Environment Variables

### **Backend (.env)**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/computerexcellenceacademy

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
REFRESH_TOKEN_EXPIRE=30d

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_specific_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
VITE_GA_ID=G-XXXXXXXXXX (Google Analytics)
```

---

## 📊 Database Models

**Key Collections:**
- **User** - Student accounts (email, password, profile)
- **Admin** - Admin accounts (restricted access)
- **Course** - Course information (title, description)
- **Batch** - Course batches (schedule, students)
- **Content** - Course chapters and lessons
- **Note** - Study materials (PDFs)
- **Examination** - Quiz/Exam setup
- **ExamAttempted** - Student exam results
- **Payment** - Razorpay transactions
- **Attendance** - Student attendance records
- **Review** - Course ratings and reviews
- **Message** - Student support messages

---

## 🎯 Key API Endpoints

**Authentication:**
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/refresh-token` - Refresh JWT

**Courses:**
- `GET /api/course` - List all courses
- `GET /api/course/:id` - Course details
- `POST /api/course` - Create course (admin)

**Content:**
- `GET /api/content/course/:courseId` - Get course content
- `POST /api/content` - Upload content (admin)

**Exams:**
- `GET /api/examination` - List exams
- `POST /api/examination/:id/submit` - Submit exam answers
- `GET /api/examination/:id/result` - Get exam result

**Payments:**
- `POST /api/payment/razorpay` - Create payment order
- `POST /api/payment/razorpay/verify` - Verify payment

---

## 💡 Tips for Users

### **Students:**
1. **Complete courses on time** - helps build a learning streak
2. **Download notes** - available offline for study
3. **Join live batches** - interact with instructors in real-time
4. **Practice exams** - before final exam, boost confidence
5. **Check leaderboard** - healthy competition with peers

### **Admins:**
1. **Schedule batches regularly** - maintain student engagement
2. **Approve reviews promptly** - show student feedback
3. **Upload quality content** - clear videos and PDFs better
4. **Set realistic passing %** - not too easy, not too hard
5. **Monitor attendance** - identify struggling students

---

## 🌟 Production Deployment

See **[SEO_OPTIMIZATION_GUIDE.md](SEO_OPTIMIZATION_GUIDE.md)** for complete deployment instructions including:
- ✅ Environment setup
- ✅ Security headers
- ✅ Sitemap submission
- ✅ Google Search Console
- ✅ Performance optimization
- ✅ Monitoring setup

---

## 🐛 Troubleshooting

**Students can't login?**
- Check if email is verified
- Verify password is correct (case-sensitive)
- Clear browser cookies and try again

**Admin can't access admin panel?**
- Use admin email (not student email)
- Verify JWT token is valid
- Check admin middleware is working

**Payments not working?**
- Verify Razorpay API keys in .env
- Check internet connection
- Ensure .env file is loaded correctly

---

## 📞 Support & Contact

- **Email:** support@computerexcellenceacademy.com
- **Phone:** +91-9369050651
- **Address:** Vedpur, Shukulpur Bazar, Ramjanki Marg, Basti, Uttar Pradesh - 272131

---

## 📄 License

This project is built for Computer Excellence Academy. All rights reserved.

---

## ✅ Production Ready Checklist

- ✅ Full authentication system (JWT)
- ✅ Complete role-based access control
- ✅ Payment integration (Razorpay)
- ✅ Email notifications
- ✅ SEO optimized
- ✅ Mobile responsive
- ✅ Animated UI with Framer Motion
- ✅ Database properly indexed
- ✅ Error handling and logging
- ✅ Rate limiting on API
- ✅ CORS configured
- ✅ Environment variables secured

**Status:** 🟢 **PRODUCTION READY**

---

**Last Updated:** April 10, 2026  
**Version:** 2.0 (Production Ready)

