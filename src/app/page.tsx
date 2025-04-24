'use client';

import { LANDING_PAGE_PICTURE_URL_1, LANDING_PAGE_PICTURE_URL_2 } from "@/util/constants";
import Image from "next/image";
import { useState } from "react";
import { getEmailNotification, createEmailNotification, updateEmailNotification } from "@/lib/firebase/preference";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState<"success" | "error">("success");

  const validateName = (name: string) => {
    // Only allow alphabets and spaces between letters
    const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
    if (!name.trim()) {
      return "Name is required";
    }
    if (!nameRegex.test(name)) {
      return "Name should only contain letters and spaces between letters";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleSubscribe = async() => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);

    setErrors({
      name: nameError,
      email: emailError
    });

    if (!nameError && !emailError) {
      setIsSubscribing(true);
      try {
        const existingNotification = await getEmailNotification(email);
        
        if (existingNotification) {
          await updateEmailNotification(email, { newsLetterProduct: true });
          setPopupMessage("You have been successfully subscribed to our newsletter!");
          setPopupType("success");
        } else {
          await createEmailNotification(email, name);
          setPopupMessage("You have been successfully subscribed to our newsletter!");
          setPopupType("success");
        }
      } catch (error) {
        console.error("Subscription failed:", error);
        setPopupMessage("Failed to subscribe. Please try again later.");
        setPopupType("error");
      } finally {
        setIsSubscribing(false);
        setShowPopup(true);
        // Clear form
        setName("");
        setEmail("");
      }
    }
  };

  return (
    <div className="bg-gray-900 text-white">
      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <div className={`text-${popupType === "success" ? "green" : "red"}-500 mb-4`}>
              {popupMessage}
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Primary Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={LANDING_PAGE_PICTURE_URL_1}
            alt="On-demand photography and videography services"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Book Creative Professionals On-Demand
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
            Find and hire local photographers & videographers instantly. 
            Post your job or browse professionals near you.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="min-h-[60vh] bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Simple, Fast Booking
            </h2>
            <p className="text-lg text-gray-300">
              Get matched with the perfect professional in minutes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Describe Your Needs</h3>
              <p className="text-gray-300">
                Tell us what you need - type of shoot, location, date, and budget
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Instant Matches</h3>
              <p className="text-gray-300">
                Review profiles, portfolios, and quotes from available professionals
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book & Pay Securely</h3>
              <p className="text-gray-300">
                Choose your pro and pay securely through our platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative min-h-[60vh]">
        <div className="absolute inset-0 z-0">
          <Image
            src={LANDING_PAGE_PICTURE_URL_2}
            alt="How it works background"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Why Choose {process.env.NEXT_PUBLIC_COMPANY_NAME}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
              <p className="text-gray-300">
                Find and book professionals within minutes, not days
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-300">
                Payment held in escrow until job completion
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Verified Pros</h3>
              <p className="text-gray-300">
                All professionals are vetted and verified
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">30-Day Storage</h3>
              <p className="text-gray-300">
                Secure cloud storage for your delivered files
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              We&apos;ll let you know as soon as {process.env.NEXT_PUBLIC_COMPANY_NAME} is ready
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className={`w-full px-6 py-3 ${
                    isSubscribing ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center`}
                >
                  {isSubscribing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
