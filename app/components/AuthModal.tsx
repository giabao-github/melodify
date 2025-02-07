"use client";

import { useEffect, useState } from 'react'
import Modal from './Modal';
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa, ViewForgottenPassword, ViewMagicLink, ViewSignIn, ViewSignUp, ViewUpdatePassword, ViewVerifyOtp } from '@supabase/auth-ui-shared';
import useAuthModal from '../hooks/useAuthModal';
import '../css/AuthModal.css';
import useLyricsModal from '../hooks/useLyricsModal';
import usePlaylistModal from '../hooks/usePlaylistModal';


const AuthModal = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { session } = useSessionContext();
  const { onClose, isOpen, buttonClick } = useAuthModal();
  const lyricsModal = useLyricsModal();
  const playlistModal = usePlaylistModal();
  const [viewType, setViewType] = useState<ViewSignIn | ViewSignUp | ViewMagicLink | ViewForgottenPassword | ViewUpdatePassword | ViewVerifyOtp>('sign_in');
  const [authView, setAuthView] = useState(viewType);
  const [modalTitle, setModalTitle] = useState('Welcome back');
  const [modalDescription, setModalDescription] = useState('Login to Melodify');

  useEffect(() => {
    switch (buttonClick) {
      case 'sign_in':
        setViewType('sign_in');
        break;
      case 'sign_up':
        setViewType('sign_up');
        break;
      case 'forgotten_password':
        setViewType('forgotten_password');
        break;
      case 'update_password':
        setViewType('update_password');
        break;
      case 'verify_otp':
        setViewType('verify_otp');
        break;
      default:
        setViewType('sign_up');
    }
  }, [buttonClick]);

  useEffect(() => {
    setAuthView(viewType);
  }, [viewType]);

  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
    }
    setAuthView(viewType);
  }, [session, router, onClose, viewType]);

  useEffect(() => {
    if (isOpen) {
      lyricsModal.onClose();
      playlistModal.onClose();
    }
  }, [isOpen]);

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  }

  useEffect(() => {
    switch (authView) {
      case 'sign_in':
        setModalTitle('Welcome back');
        setModalDescription('Login to Melodify');
        break;
      case 'sign_up':
        setModalTitle('Register an account');
        setModalDescription('Sign up to enjoy music');
        break;
      case 'forgotten_password':
        setModalTitle('Reset your password');
        setModalDescription('Enter the email address associated with your Melodify account and we\'ll send you a password reset link');
        break;
      default:
        setModalTitle('Welcome back');
    }
  }, [authView]);

  // Customized error messages
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.classList.contains('supabase-auth-ui_ui-message')) {
              const originalErrorMessage = node.innerHTML.trim();
              let translatedErrorMessage = '';

              switch (originalErrorMessage) {
                case 'Anonymous sign-ins are disabled':
                translatedErrorMessage = 'Please provide an email with the correct format';
                break;
              case 'Signup requires a valid password':
                translatedErrorMessage = 'Please provide a valid password';
                break;
              case 'User already registered':
                translatedErrorMessage = 'This address is already linked to an existing account';
                break;
              case 'Only an email address or phone number should be provided on signup.':
                translatedErrorMessage = 'Only an email with the valid format is accepted for account registration';
                break;
              case 'Signups not allowed for this instance':
                translatedErrorMessage = 'Account registration is not allowed for this instance';
                break;
              case 'Email signups are disabled':
                translatedErrorMessage = 'Account registration via email is disabled';
                break;
              case 'Email link is invalid or has expired':
                translatedErrorMessage = 'The email link is invalid or has been expired';
                break;
              case 'Token has expired or is invalid':
                translatedErrorMessage = 'The token is invalid or has been expired';
                break;
              case 'The new email address provided is invalid':
                translatedErrorMessage = 'The new email address provided is in the wrong format';
                break;
              case 'Password should be at least 8 characters. Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789.':
                translatedErrorMessage = 'Password should be at least 8 characters, containing both digit(s) and letter(s)';
                break;
              case 'Invalid login credentials':
                translatedErrorMessage = 'Incorrect or unregistered credentials';
                break;
              case 'missing email or phone':
                translatedErrorMessage = 'A registered email and password are required to sign in';
                break;
              default:
                translatedErrorMessage = originalErrorMessage;
              }

              // Replace the original message with the custom message
              node.innerHTML = translatedErrorMessage;
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

  return (
    <Modal
      title={modalTitle}
      description={modalDescription}
      isOpen={isOpen}
      onChange={onChange}
    >
      <Auth
        view={authView}
        showLinks={false}
        theme='dark'
        providers={['google', 'facebook', 'github']}
        supabaseClient={supabaseClient}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#e4a020',
                brandAccent: '#e4a020',
                inputLabelText: '#fff',
                inputBorderHover: '#e4a020',
                anchorTextColor: '#fff',
                anchorTextHoverColor: '#ffff00',
              },
            },
          },
          style: {
            button: {
              marginBottom: '8px',
              border: '#e4a020 solid 1px',
              borderRadius: '50px',
            },
            label: {
              fontWeight: '600',
              fontSize: '16px',
            },
            input: {
              border: '#fff solid 1px',
              borderRadius: '8px',
              transition: 'border 0.3s ease',
            },
          },
        }}
        localization={{
          variables: {
            sign_in: {
              password_label: 'Password',
            },
            forgotten_password: {
              email_input_placeholder: 'name@domain.com',
              button_label: 'Send link',
            },
            sign_up: {
              email_input_placeholder: 'name@domain.com',
              password_input_placeholder: 'At least 8 characters, including both digits and letters',
              email_label: 'Enter your email address',
              password_label: 'Create a secured password'
            }
          },
        }}
      />
      <div className='flex flex-col gap-y-2 mt-3 text-sm items-center'>
        {
          authView === 'sign_in' &&
          (
            <button className='font-semibold hover:underline hover:text-yellow-300' onClick={() => setAuthView('forgotten_password')}>Forgot your password?</button>
          )
        }
        {
          authView === 'sign_up' && 
          (
            <span>
              Already have an account?&nbsp;
              <button className='font-semibold hover:underline hover:text-yellow-300' onClick={() => setAuthView('sign_in')}>Log in here</button>
            </span>
          )
        }
        {
          authView === 'sign_in' &&
          (
            <span>
              Don&apos;t have an account?&nbsp;
              <button className='font-semibold hover:underline hover:text-yellow-300' onClick={() => setAuthView('sign_up')}>Sign up for Melodify</button>
            </span>
          )
        }
        {
          authView === 'forgotten_password' &&
          (
            <button className='font-semibold hover:underline hover:text-yellow-300' onClick={() => setAuthView('sign_in')}>Back to login</button>
          )
        }
      </div>
    </Modal>
  )
}

export default AuthModal;
