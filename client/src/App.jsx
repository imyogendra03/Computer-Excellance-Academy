import React, { lazy, Suspense } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./components/Loader";
import GlobalAuthError from "./components/GlobalAuthError";
import RouteSEO from "./components/RouteSEO";
import RouteEffects from "./components/RouteEffects";
import AIAssistantWidget from "./components/AIAssistantWidget";

// Public Pages
const Home = lazy(() => import("./pages/Home"));
const Registration = lazy(() => import("./pages/Registration"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Support = lazy(() => import("./pages/Support"));
const Notes = lazy(() => import("./pages/Notes").then(mod => ({ default: mod.Notes })));
const Course = lazy(() => import("./pages/Course"));
const BatchPreview = lazy(() => import("./pages/BatchPreview"));
const Component = lazy(() => import("./pages/Component"));

// Admin Pages
const Dashboard = lazy(() => import("./pages/Admin/AdminMainDashboard"));
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin"));
const AdminHome = lazy(() => import("./pages/Admin/AdminHome"));
const AdminCourses = lazy(() => import("./pages/Admin/AdminCourses"));
const AdminBatches = lazy(() => import("./pages/Admin/AdminBatches"));
const AdminNotes = lazy(() => import("./pages/Admin/AdminNotes"));
const AdminPayments = lazy(() => import("./pages/Admin/AdminPayments"));
const AdminCoupons = lazy(() => import("./pages/Admin/AdminCoupons"));
const AdminReviews = lazy(() => import("./pages/Admin/AdminReviews"));
const AttendanceDashboard = lazy(() => import("./pages/Admin/AttendanceDashboard"));
const Session = lazy(() => import("./pages/Admin/Session"));
const Subject = lazy(() => import("./pages/Admin/Subject"));
const Examinee = lazy(() => import("./pages/Admin/Examinee"));
const QuestionBank = lazy(() => import("./pages/Admin/QuestionBank"));
const Examination = lazy(() => import("./pages/Admin/Examination"));
const Report = lazy(() => import("./pages/Admin/Report"));
const ExamResultsDeclaration = lazy(() => import("./pages/Admin/ExamResultDeclaration"));
const Contact = lazy(() => import("./pages/Admin/Contact"));
const Password = lazy(() => import("./pages/Admin/Password"));
const AdminEnrollments = lazy(() => import("./pages/Admin/AdminEnrollments"));

// User Pages
const UserDash = lazy(() => import("./pages/User/UserDash"));
const UserHome = lazy(() => import("./pages/User/UserHome"));
const UserCourses = lazy(() => import("./pages/User/UserCourses"));
const UserNotes = lazy(() => import("./pages/User/UserNotes"));
const UserPayments = lazy(() => import("./pages/User/UserPayments"));
const MyBatches = lazy(() => import("./pages/User/MyBatches"));
const BatchDetails = lazy(() => import("./pages/User/BatchDetails"));
const Profile = lazy(() => import("./pages/User/Profile"));
const GetExam = lazy(() => import("./pages/User/GetExam"));
const MyExam = lazy(() => import("./pages/User/MyExam"));
const Chanpass = lazy(() => import("./pages/User/Chanpass"));
const Result = lazy(() => import("./pages/User/Result"));
const StudentAttendance = lazy(() => import("./pages/User/StudentAttendance"));
const ContactA = lazy(() => import("./pages/User/ContactA"));
const Leaderboard = lazy(() => import("./pages/User/Leaderboard"));

function App() {
  return (
    <Router>
      <RouteSEO />
      <RouteEffects />
      <GlobalAuthError />
      <AIAssistantWidget />
      <Suspense fallback={<Loader />}>
        <AnimatePresence mode="wait">
          <Routes>
            {/*  Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/support" element={<Support />} />
            <Route path="/courses" element={<Course />} />
            <Route path="/course" element={<Course />} />
            <Route path="/batch-preview/:id" element={<BatchPreview />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/adlogin" element={<AdminLogin />} />

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<Dashboard />}>
              <Route index element={<AdminHome />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="batches" element={<AdminBatches />} />
              <Route path="notes" element={<AdminNotes />} />
              <Route path="session" element={<Session />} />
              <Route path="subject" element={<Subject />} />
              <Route path="examinee" element={<Examinee />} />
              <Route path="questionbank" element={<QuestionBank />} />
              <Route path="examination" element={<Examination />} />
              <Route path="report" element={<Report />} />
              <Route path="result" element={<ExamResultsDeclaration />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="attendance" element={<AttendanceDashboard />} />
              <Route path="enrollments" element={<AdminEnrollments />} />
              <Route path="contact" element={<Contact />} />
              <Route path="password" element={<Password />} />
            </Route>

            {/*  User Dashboard Routes */}
            <Route path="/UserDash" element={<UserDash />}>
              <Route index element={<UserHome />} />
              <Route path="courses" element={<UserCourses />} />
              <Route path="notes" element={<UserNotes />} />
              <Route path="my-batches" element={<MyBatches />} />
              <Route path="batch/:id" element={<BatchDetails />} />
              <Route path="contact1" element={<ContactA />} />
              <Route path="myexam" element={<MyExam />} />
              <Route path="profile" element={<Profile />} />
              <Route path="getexam/:id" element={<GetExam />} />
              <Route path="payments" element={<UserPayments />} />
              <Route path="chanpass" element={<Chanpass />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="results" element={<Result />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>

            {/* Fallback  */}
            <Route path="*" element={<Component />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </Router>
  );
}

export default App;
