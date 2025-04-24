import React from 'react';

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About {process.env.NEXT_PUBLIC_COMPANY_NAME}</h1>

      <section className="mb-8">
        <p className="mb-4">
          <strong>{process.env.NEXT_PUBLIC_COMPANY_NAME}</strong> is an on demand platform that connects clients with skilled photographers, videographers, and editors. Whether you need someone for an event, a business shoot, or content creation, {process.env.NEXT_PUBLIC_COMPANY_NAME} makes it easy to find and hire the right professional.
        </p>
        <p className="mb-4">
          Our platform is built to give both clients and creatives a better experience. Clients can post their needs or browse talent directly, while professionals can showcase their work, apply for gigs, and get paid securely through the platform.
        </p>
        <p className="mb-4">
          We believe creative work deserves a smooth, trusted hiring process. That is why {process.env.NEXT_PUBLIC_COMPANY_NAME} includes smart matching tools, verified profiles, secure payments, and fast file delivery all in one place.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
        <p>
          To simplify the way people connect with creative talent and to support professionals in growing their careers through better tools, exposure, and opportunity.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">The Founders</h2>
        <p className="mb-4">
          <strong>Hue Jonghyuk Park</strong> and <strong>Tyler</strong> met while working at the same company. Over two years, they built a strong working relationship and spent countless hours talking about the future how to solve real life problems, create better systems, and bring more value to everyday people.
        </p>
        <p>
          Those conversations sparked the idea for {process.env.NEXT_PUBLIC_COMPANY_NAME} a platform designed to remove the stress from finding creative help, while empowering professionals with the freedom to work on their own terms.
        </p>
      </section>
    </div>
  );
};

export default AboutPage; 