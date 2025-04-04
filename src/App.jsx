import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./Components/Home";
import Login from "./Components/Deluxe/Login";
import BookingCard from "./Components/BookingCard";
import QuantityBirthday from "./Components/Quantity";
import ThankYouPage from "./Components/Thankyou";

import Context from "./Components/ContextApi/Context";
import Menu from "./Components/Menu";
import Packages from "./Components/Package/Package";
import Package from "./Components/Package/PackDum";
import Footer from './Components/Footer';
import Rolexe from "./Components/Rolexe/Rolexe";
import Deluxe from "./Components/Deluxe/Deluxe";
import Navbar from "./Components/Navbar";
import ServicesMain from './Components/Services/ServicesMain';
import ContactUs from './Components/ContactUs/Contact';
import TermsAndCondition from './Components/Terms&Condition/TermsAndCondition';
import GalleryMain from './Components/BirthdayGallery/GalleryMain';
import TermsMain from './Components/Terms&Condition/Terms';
import ScrollToTop from './Components/ScrollTop';
import PrivacyPolicy from './Components/privacy-policy/privacy';
import RefundPolicy from './Components/Refund';
import AboutUs from './Components/AboutUs/AboutUs';
// import AuthProvider, { useAuth } from "./Components/ContextAuth/AuthContext"; // Import the new AuthProvider
import AuthProvider from "./Components/ContextAuth/AuthProvider";
import {useAuth} from "./Components/ContextAuth/AuthProvider";

// Protected Route component using our new context
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Context>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Login route - accessible without authentication */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
          />
          
          {/* Protected routes - require authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Home />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="BookingCard" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <BookingCard />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="QuantityBirthday" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <QuantityBirthday />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="ThankYouPage" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <ThankYouPage />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="Menu" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Menu />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="Packages" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Packages />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="Rolexe" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Rolexe />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="Deluxe" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Deluxe />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="ServicesMain" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <ServicesMain />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="Contactus" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <ContactUs />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="TermsMain" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <TermsMain />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="Package" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Package />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="GalleryMain" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <GalleryMain />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="RefundPolicy" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <RefundPolicy />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="TermsAndCondition" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <TermsAndCondition />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="AboutUs" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <AboutUs />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="PrivacyPolicy" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <PrivacyPolicy />
                <Footer />
              </>
            </ProtectedRoute>
          } />
          
          {/* Redirect any unknown routes to login if not authenticated, otherwise to home */}
          <Route path="*" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </BrowserRouter>
    </Context>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;