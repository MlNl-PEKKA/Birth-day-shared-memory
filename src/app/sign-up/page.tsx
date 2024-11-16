'use client';

import { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { registerAppUserSchema } from '@/lib/dtos';
import { trpc } from '../_providers/trpc-provider';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';

export default function SignUp() {
  const [formData, setFormData] = useState<z.infer<typeof registerAppUserSchema>>({
    first_name: '',
    last_name: '', 
    email: '',
    password: '',
    phone_number: '',
    profile_picture: undefined,
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { mutate: signUp } = trpc.registerAppUser.useMutation({
    onSuccess: () => {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    },
    onError: () => {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  });
  const firstNameControls = useAnimation();
  const lastNameControls = useAnimation();
  const emailControls = useAnimation();
  const phoneControls = useAnimation();
  const passwordControls = useAnimation();
  const imageControls = useAnimation();

  const handleInputAnimation = async (control: any) => {
    await control.start({
      scale: 1.02,
      transition: { duration: 0.2 }
    });
    await control.start({
      scale: 1,
      transition: { duration: 0.2 }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        handleInputAnimation(imageControls);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.first_name) errors.push("First Name is required");
    if (!formData.last_name) errors.push("Last Name is required");
    if (!formData.email) errors.push("Email is required");
    if (!formData.phone_number) errors.push("Phone Number is required");
    if (!formData.password) errors.push("Password is required");
    else if (formData.password.length < 5) errors.push("Password must be at least 5 characters");

    setValidationErrors(errors);
    const isValid = errors.length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      signUp({...formData, profile_picture: profileImage || undefined});
    } else {
      // Shake animation for validation errors
      firstNameControls.start({
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      });
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateForm(); // Validate immediately on change
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          background: [
            'linear-gradient(to bottom right, #f3e7ff, #e7f0ff, #ffe7f3)',
            'linear-gradient(to bottom right, #ffe7f3, #f3e7ff, #e7f0ff)',
            'linear-gradient(to bottom right, #e7f0ff, #ffe7f3, #f3e7ff)',
            'linear-gradient(to bottom right, #f3e7ff, #e7f0ff, #ffe7f3)',
          ],
          opacity: 1
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 -z-10"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -10, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-[30rem] h-[30rem] bg-blue-400/30 rounded-full blur-3xl"
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl"
      >
        <motion.h2 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-3xl font-bold mb-4 text-gray-800 text-center"
        >
          Create Your Account
        </motion.h2>
        
        <p className="text-gray-600 text-center mb-8">
          Start capturing and celebrating life's precious moments
        </p>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 rounded-lg"
          >
            {validationErrors.map((error, index) => (
              <motion.p 
                key={index}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-red-600 text-sm mb-1"
              >
                • {error}
              </motion.p>
            ))}
          </motion.div>
        )}

        {/* Submit Button at Top */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <motion.button
            type="submit"
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full px-6 py-3 rounded-lg font-semibold text-lg shadow-lg 
              ${validationErrors.length === 0 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 cursor-pointer' 
                : 'bg-gradient-to-r from-purple-400 to-blue-400 text-white cursor-pointer'}
              transition-all duration-300`}
          >
            Create Account
          </motion.button>
        </motion.div>

        {/* Submit Button Location Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative mb-8 text-center"
        >
          <motion.div
            animate={{ y: [-5, 0, -5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-purple-600"
          >
            <span className="text-2xl">↑</span>
            <p className="text-sm font-medium">Submit button moved to top for easier access!</p>
          </motion.div>
        </motion.div>

        {/* Profile Image Upload Section */}
        <motion.div 
          className="flex flex-col items-center mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div 
            className="relative w-32 h-32 mb-4 cursor-pointer group"
            whileHover={{ scale: 1.05 }}
            onClick={() => fileInputRef.current?.click()}
          >
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Profile Preview"
                fill
                className="rounded-full object-cover border-4 border-purple-500"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-purple-500">
                <span className="text-4xl text-gray-400">📷</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">Change Photo</span>
            </div>
          </motion.div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <p className="text-sm text-gray-600">Click to upload profile picture</p>
        </motion.div>

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-4 p-4 bg-green-100 rounded-lg text-center"
          >
            <motion.div
              animate={{
                rotate: [0, 0, 14, -8, 0],
                scale: [1, 1.2, 1, 1.1, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-4xl mb-2"
            >
              👍😊
            </motion.div>
            <p className="text-green-700">Registration successful! Please check your email to verify your account.</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-4 p-4 bg-red-100 rounded-lg text-center"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [-5, 5, -5]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-4xl mb-2"
            >
              😢
            </motion.div>
            <p className="text-red-700">Oops! Something went wrong. Please try again.</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <motion.div animate={firstNameControls}>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => {
                    handleInputChange('first_name', e.target.value);
                    handleInputAnimation(firstNameControls);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                            transition-all duration-200 bg-black/5 backdrop-blur-sm text-black placeholder-gray-500"
                  placeholder="John"
                  required
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <motion.div animate={lastNameControls}>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => {
                    handleInputChange('last_name', e.target.value);
                    handleInputAnimation(lastNameControls);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                            transition-all duration-200 bg-black/5 backdrop-blur-sm text-black placeholder-gray-500"
                  placeholder="Doe"
                  required
                />
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <motion.div animate={emailControls}>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  handleInputChange('email', e.target.value);
                  handleInputAnimation(emailControls);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                          transition-all duration-200 bg-black/5 backdrop-blur-sm text-black placeholder-gray-500"
                placeholder="john.doe@example.com"
                required
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <motion.div animate={phoneControls}>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => {
                  handleInputChange('phone_number', e.target.value);
                  handleInputAnimation(phoneControls);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                          transition-all duration-200 bg-black/5 backdrop-blur-sm text-black placeholder-gray-500"
                placeholder="+1 (555) 000-0000"
                required
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <motion.div animate={passwordControls}>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  handleInputChange('password', e.target.value);
                  handleInputAnimation(passwordControls);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                          transition-all duration-200 bg-black/5 backdrop-blur-sm text-black placeholder-gray-500"
                placeholder="••••••••"
                required
                minLength={5}
              />
            </motion.div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 5 characters long
            </p>
          </motion.div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Log in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
