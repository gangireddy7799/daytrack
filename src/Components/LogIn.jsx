import React from 'react';
import GoogleButton from 'react-google-button';
import { UserAuth } from '../context/authContext';

export default function LogIn() {
  const { googleSignIn } = UserAuth();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    }
  };

  return (
    <div className='logInBtn'>
      <GoogleButton onClick={handleGoogleSignIn} />
    </div>
  );
}
