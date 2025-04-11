// import React, { useState } from "react";

const Kontakt: React.FC = () => {
  //   const [formData, setFormData] = useState({
  //     name: "",
  //     email: "",
  //     message: "",
  //   });

  // const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">(
  //   "idle"
  // );

  // const handleChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // Simulate sending an email
  //   try {
  //     // Replace this with your email-sending logic
  //     console.log("Sending email to info@bakverkstan.se", formData);
  //     setFormStatus("success");
  //     setFormData({ name: "", email: "", message: "" });
  //   } catch (error) {
  //     console.error("Error sending email:", error);
  //     setFormStatus("error");
  //   }
  // };

  return (
    <div className="bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Address Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Bakverkstan
            </h1>

            <p className="text-gray-600">
              <br />
              Bäckamansgatan 6
              <br />
              25230 Helsingborg
              <br />
              Sverige
            </p>
            <p className="text-gray-600 mt-4">
              <strong>Tel:</strong> 0733793913
            </p>
            <p className="text-gray-600 mt-4">
              <strong>Mail:</strong> info@bakverkstan.se
            </p>
          </div>

          {/* Contact Form */}
          {/* <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Kontakta oss!
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Namn
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Medelande
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Skicka meddelande
              </button>
            </form>
            {formStatus === "success" && (
              <p className="mt-4 text-green-600">
                Ditt meddelande har skickats!
              </p>
            )}
            {formStatus === "error" && (
              <p className="mt-4 text-red-600">
                Någonting gick fel. Försök gärna igen.
              </p>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Kontakt;
