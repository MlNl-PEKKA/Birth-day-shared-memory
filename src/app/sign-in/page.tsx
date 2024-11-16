'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'APP_USER' | 'USER'>('APP_USER');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signIn('credentials', {
      email,
      password,
      userType,
      redirect: true,
      callbackUrl: '/'
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <select
        value={userType}
        onChange={(e) => setUserType(e.target.value as 'APP_USER' | 'USER')}
      >
        <option value="APP_USER">App User</option>
        <option value="USER">Admin User</option>
      </select>
      <button type="submit">Sign In</button>
    </form>
  );
} 