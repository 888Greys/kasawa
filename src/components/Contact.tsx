import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, User, Mail as MailIcon } from 'lucide-react';

interface ContactProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact: React.FC<ContactProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitted(true);
    setLoading(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Us</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Get in Touch
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Have questions about our products or need assistance? We're here to help! 
                  Reach out to us through any of the channels below or fill out the contact form.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Mail className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Email Support</h4>
                    <p className="text-gray-600 dark:text-gray-300">support@kasawa.com</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Phone className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Phone Support</h4>
                    <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Business Address</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      123 Cannabis Street<br />
                      Suite 420<br />
                      Portland, OR 97201
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Clock className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Business Hours</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Frequently Asked Questions</h4>
                <div className="space-y-3">
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer list-none p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">How do I track my order?</span>
                      <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <div className="p-3 text-gray-600 dark:text-gray-300">
                      You can track your order by logging into your account and visiting the Orders section. 
                      You'll receive tracking information via email once your order ships.
                    </div>
                  </details>

                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer list-none p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">What payment methods do you accept?</span>
                      <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <div className="p-3 text-gray-600 dark:text-gray-300">
                      We accept all major credit cards, PayPal, and cryptocurrency payments. 
                      All transactions are secure and encrypted.
                    </div>
                  </details>

                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer list-none p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">Do you ship internationally?</span>
                      <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <div className="p-3 text-gray-600 dark:text-gray-300">
                      Currently, we only ship within the United States to states where cannabis is legal. 
                      We're working on expanding our shipping options.
                    </div>
                  </details>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Send us a Message
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Message Sent!</h4>
                  </div>
                  <p className="text-green-700 dark:text-green-300">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      placeholder="Tell us how we can help you..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 