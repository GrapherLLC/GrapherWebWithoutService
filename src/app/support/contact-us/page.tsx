import React from 'react';

const ContactUsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-dark-text-primary">Contact Us</h1>
      
      <div className="bg-dark-card rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-dark-text-primary">Email</h2>
            <p className="text-dark-text-secondary">
              <a 
                href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_CONTACT_EMAIL}`}
                className="text-primary-500 hover:text-primary-400 transition-colors"
              >
                {process.env.NEXT_PUBLIC_COMPANY_CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage; 