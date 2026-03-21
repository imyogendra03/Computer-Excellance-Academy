import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPayments from "./pages/Admin/AdminPayments";
import UserPayments from "./pages/User/UserPayments";

import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Dashboard from "./pages/Admin/Dashboard";
import Session from "./pages/Admin/Session";
import Subject from "./pages/Admin/Subject";
import Examinee from "./pages/Admin/Examinee";
import AdminLogin from "./pages/Admin/AdminLogin";
import QuestionBank from "./pages/Admin/QuestionBank";
import UserDash from "./pages/User/UserDash";
import Examination from "./pages/Admin/Examination";
import Report from "./pages/Admin/Report";
import Contact from "./pages/Admin/Contact";
import ContactA from "./pages/User/ContactA";
import MyExam from "./pages/User/MyExam";
import MyBatches from "./pages/User/MyBatches";
import BatchDetails from "./pages/User/BatchDetails";
import Profile from "./pages/User/Profile";
import GetExam from "./pages/User/GetExam";
import Password from "./pages/Admin/Password";
import Chanpass from "./pages/User/Chanpass";
import ExamResultsDeclaration from "./pages/Admin/ExamResultDeclaration";
import Result from "./pages/User/Result";
import AdminHome from "./pages/Admin/AdminHome";
import AdminCourses from "./pages/Admin/AdminCourses";
import AdminBatches from "./pages/Admin/AdminBatches";
import AdminNotes from "./pages/Admin/AdminNotes";
import Component from "./pages/Component";
import UserHome from "./pages/User/UserHome";
import AboutUs from "./pages/AboutUs";
import { Notes } from "./pages/notes";
import Course from "./pages/Course";
import UserCourses from "./pages/User/UserCourses";
import UserNotes from "./pages/User/UserNotes";


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/courses" element={<Course />} />
        <Route path="/course" element={<Course />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/adlogin" element={<AdminLogin />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<Dashboard />}>
        <Route path="payments" element={<AdminPayments />} />
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
          <Route path="contact" element={<Contact />} />
          <Route path="password" element={<Password />} />
        </Route>

        {/* User Dashboard Routes */}
        <Route path="/UserDash" element={<UserDash />}>
        <Route path="payments" element={<UserPayments />} />
          <Route index element={<UserHome />} />
          <Route path="courses" element={<UserCourses />} />
          <Route path="notes" element={<UserNotes />} />
          <Route path="my-batches" element={<MyBatches />} />
          <Route path="batch/:id" element={<BatchDetails />} />
          <Route path="contact1" element={<ContactA />} />
          <Route path="myexam" element={<MyExam />} />
          <Route path="profile" element={<Profile />} />
          <Route path="getexam/:id" element={<GetExam />} />
          <Route path="chanpass" element={<Chanpass />} />
          <Route path="results" element={<Result />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Component />} />
      </Routes>
    </Router>
  );
}

export default App;
