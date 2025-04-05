import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../index';
import emailjs from '@emailjs/browser';

const TermsMain = () => {
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const bookButtonRef = useRef(null);
  
  useEffect(() => {
    const data = localStorage.getItem('bookingData');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setBookingData(parsedData);
      } catch (error) {
        console.error("Error parsing booking data:", error);
        toast.error("Error loading your booking information");
        navigate('/');
      }
    } else {
      navigate('/');
    }
    
    setTimeout(() => {
      setAnimateIn(true);
    }, 100);
  }, [navigate]);

  const termsItems = [
    "We do NOT provide any movie/OTT accounts. We will do the setups using your OTT accounts/downloaded content.",
    "Smoking/Drinking is NOT allowed inside the theater.",
    "Any DAMAGE caused to theater, including decorative materials like ballons, lights etc will have to be reimbursed.",
    "Guests are requested to maintain CLEANLINESS inside the theater.",
    "Party poppers/Snow sprays/Cold Fire, and any other similar items are strictly prohibited inside the theater.",
    "Carrying AADHAAR CARD is mandatory. It will be scanned during entry.",
    "Couples under 18 years of age are not allowed to book the theatre",
    "Pets are strictly not allowed inside the theatre"
  ];
  
  const Refund = [
    "Cancellations are allowed at least 72 hrs before the slot time."
  ];

  const sendEmail = async (bookingData) => {
    try {
      const bookingTime = bookingData.lastItem
        ? `${bookingData.lastItem.start} - ${bookingData.lastItem.end}`
        : "Not Available";
  
      // Sending email using EmailJS
      const templateParams = {
        to_email: bookingData.email,
        booking_date: bookingData.date,
        booking_time: bookingTime,
        whatsapp_number: bookingData.whatsapp,
        num_people: bookingData.people,
        decoration: bookingData.wantDecoration,
        extraDecorations: bookingData.extraDecorations,
        bookingName: bookingData.bookingName,
        slotType: bookingData.slotType,
        email: bookingData.email
      };
      
      console.log("Sending booking notifications...");
      
      // Process these operations in parallel for better performance
      await Promise.all([
        // SheetDB API call
        fetch('https://sheetdb.io/api/v1/x6sflb64abrf4', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: [
              {
                to_email: 'lagishettymadhu05@gmail.com',
                booking_date: bookingData.date,
                booking_time: bookingData.lastItem ? `${bookingData.lastItem.start} - ${bookingData.lastItem.end}` : "Not Available",
                whatsapp_number: bookingData.whatsapp,
                num_people: bookingData.people,
                decoration: bookingData.wantDecoration ? "Yes" : "No",
                extraDecorations: bookingData.extraDecorations,
                bookingName: bookingData.bookingName,
                slotType: bookingData.slotType,
                email: bookingData.email,
                NameUser: bookingData.NameUser,
                total_amount: bookingData.totalAmount || calculateTotal(bookingData)
                
              }
            ]
          }),
        }),
      
        
        
        // EmailJS call
        emailjs.send(
          'service_codgdqj',
          'template_g2368km',
          templateParams,
          '6qCccpL5QSAWvn5AJ'
        ),
        
        // Formspree call
        fetch("https://formspree.io/f/xldjejzn", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: bookingData.email,
            booking_date: bookingData.date,
            booking_time: bookingData.lastItem ? `${bookingData.lastItem.start} - ${bookingData.lastItem.end}` : "Not Available",
            whatsapp_number: bookingData.whatsapp,
            num_people: bookingData.people,
            decoration: bookingData.wantDecoration ? "Yes" : "No",
            extraDecorations: bookingData.extraDecorations
          }),
        })
      ]);
  
      console.log("All notifications sent successfully");
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.warning("Your booking is confirmed, but we couldn't send all notifications.");
    }
  };

  const sendWhatsAppReminder = async (params) => {
    try {
      const { to, date, time } = params;
      const formattedNumber = to.startsWith('+') ? to : `+${to}`;
      
      console.log(`Sending WhatsApp confirmation to ${formattedNumber}`);
      
      const response = await fetch('https://backend-kf6u.onrender.com/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          to: formattedNumber, 
          date, 
          time,
          message: `Your booking is confirmed! \n\nDate: ${date} \nTime: ${time} \n\nThank you for your booking!`
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to send WhatsApp reminder: ${errorData.message || response.status}`);
      }
      
      console.log("WhatsApp message sent successfully");
    } catch (error) {
      console.error('Error sending WhatsApp reminder:', error);
      // Don't show toast here as it's not critical - we'll just log the error
    }
   
  };

  const saveToFirebase = async () => {
    if (!bookingData) return;
    
    try {
      console.log("Saving booking to Firebase...");
      
      const saveData = {
        ...bookingData,
        status: "booked",
        timestamp: new Date()
      };

      const docRef = await addDoc(collection(db, bookingData.slotType), saveData);
      console.log("Booking saved to Firebase with ID:", docRef.id);
      return { ...saveData, id: docRef.id };
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      toast.warning("There was an issue saving your booking. Please contact support.");
      throw error;
    }
  };

  const handleBooking = async () => {
    if (!isChecked) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    try {
      setIsProcessing(true);
      toast.info("Processing your booking...");
      
      // Save booking to Firebase
      const savedBooking = await saveToFirebase();
      
      // Execute these in parallel to improve speed
      await Promise.all([
        sendEmail(savedBooking),
        bookingData?.lastItem ? 
          sendWhatsAppReminder({
            to: `+91${bookingData.whatsapp}`,
            date: bookingData.date,
            time: `${bookingData.lastItem.start} - ${bookingData.lastItem.end}`
          }) : Promise.resolve()
      ]);

      localStorage.removeItem('bookingData');
      toast.success("Booking confirmed! Check your email and WhatsApp for details.");
      navigate("/ThankYouPage");
    } catch (error) {
      console.error("Error processing booking:", error);
      toast.error("Booking failed. Please try again or contact support.");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isChecked && bookButtonRef.current) {
      bookButtonRef.current.classList.add('button-pulse');
    } else if (bookButtonRef.current) {
      bookButtonRef.current.classList.remove('button-pulse');
    }
  }, [isChecked]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-400 to-pink-50 pt-16 pb-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto pt-[3%]">
        <div className={`transition-all duration-500 transform ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 py-4 px-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white text-center">Terms & Conditions</h1>
            </div>
            
            <div className="p-6 md:p-8">
              <div className={`space-y-6 transition-all duration-700 delay-300 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <ol className="list-decimal pl-6 space-y-4">
                  {termsItems.map((item, index) => (
                    <li 
                      key={index} 
                      className="text-gray-800 pb-3 border-b border-gray-100 last:border-0 transition-all duration-300"
                      style={{ 
                        transitionDelay: `${300 + (index * 50)}ms`,
                        opacity: animateIn ? 1 : 0,
                        transform: animateIn ? 'translateX(0)' : 'translateX(-20px)'
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ol>
                
                <div 
                  className="mt-8 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500"
                  style={{ 
                    transitionDelay: '800ms',
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn ? 'translateY(0)' : 'translateY(20px)'
                  }}
                >
                  <h2 className="text-xl font-bold mb-3 text-purple-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Cancellation Policy
                  </h2>
                  <p className="text-gray-700">{Refund}</p>
                </div>

                <div 
                  className="mt-8"
                  style={{ 
                    transitionDelay: '900ms',
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn ? 'translateY(0)' : 'translateY(20px)'
                  }}
                >
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="text-gray-700 font-medium">I have read and agree to the terms and conditions</span>
                  </label>
                </div>

                {bookingData && (
                  <div 
                    className="mt-6"
                    style={{ 
                      transitionDelay: '1000ms',
                      opacity: animateIn ? 1 : 0,
                      transform: animateIn ? 'translateY(0)' : 'translateY(20px)'
                    }}
                  >
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg shadow-inner mb-6">
                      <h3 className="font-semibold text-lg mb-3 text-purple-800">Booking Summary</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-800 font-medium">Date:</span>
                          <span className="text-lg font-medium">{bookingData.date}</span>
                        </div>
                        
                        {bookingData.lastItem && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-medium">Time:</span>
                            <span className="text-lg font-medium">{`${bookingData.lastItem.start} - ${bookingData.lastItem.end}`}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-800 font-medium">Number of People:</span>
                          <span className="text-lg font-medium">{bookingData.people}</span>
                        </div>
                        
                        {bookingData.wantDecoration && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-medium">Decoration:</span>
                            <span className="text-lg font-medium">Yes</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      ref={bookButtonRef}
                      onClick={handleBooking}
                      disabled={!isChecked || isProcessing}
                      className={`w-full rounded-lg py-4 font-medium text-lg transition-all duration-300 transform ${
                        isChecked ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg hover:-translate-y-1' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        `Confirm Booking`
                      )}
                    </button>
                    
                    <p className="text-center text-sm text-gray-500 mt-4">
                      By clicking the button above, you agree to our Terms and Conditions
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(237, 100, 166, 0.7);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(237, 100, 166, 0);
          }
        }
        
        .button-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default TermsMain;