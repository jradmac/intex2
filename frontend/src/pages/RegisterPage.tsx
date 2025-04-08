import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import bgImage from '../images/WelcomePageBanner.png';
import logo from '../images/CineNicheLogo.png';

const API_BASE_URL = 'http://localhost:5000/api';

enum RegisterStep {
  INITIAL = 'initial',
  PROFILE = 'profile'
}

const isValidPassword = (password: string): boolean => password.length >= 10;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<RegisterStep>(RegisterStep.INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');

  const [tempUserData, setTempUserData] = useState<any>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);

  useEffect(() => {

    const storedToken = sessionStorage.getItem('tempToken');
    const storedUserData = sessionStorage.getItem('tempUserData');


    if (storedToken && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setTempToken(storedToken);
        setTempUserData(userData);
        setCurrentStep(RegisterStep.PROFILE);
      } catch (err) {
        sessionStorage.removeItem('tempToken');
        sessionStorage.removeItem('tempUserData');
      }
    }
  }, []);

  const handleInitialRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidPassword(password)) {
      setError('Password must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {

      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName,
      });

      const userId = response.data.userId || `user-${Date.now()}`;
      // Important: Use the token directly from the API response if provided
      const token = response.data.token || `mock-token-${Date.now()}`;

      const userData = {
        userId,
        email,
        firstName,
        lastName,
        role: response.data.role || 'User'
      };

      setTempToken(token);
      setTempUserData(userData);

      sessionStorage.setItem('tempToken', token);
      sessionStorage.setItem('tempUserData', JSON.stringify(userData));

      setCurrentStep(RegisterStep.PROFILE);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
              
    try {
      let userData = tempUserData;
      let token = tempToken;

      if (!userData || !token) {

        const storedToken = sessionStorage.getItem('tempToken');
        const storedUserData = sessionStorage.getItem('tempUserData');

        if (storedToken && storedUserData) {
          token = storedToken;
          userData = JSON.parse(storedUserData);
        }
      }

      if (!userData || !token) throw new Error('Missing user data. Please try registering again.');

      await fetch(`${API_BASE_URL}/User/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          age: parseInt(age),
          gender,
          phone
        })
      });

      const completeUserData = {
        ...userData,
        age: parseInt(age),
        gender,
        phone,
        profileCompleted: true
      };

      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(completeUserData));

      sessionStorage.removeItem('tempToken');
      sessionStorage.removeItem('tempUserData');

      navigate('/home');
    } catch (err) {

      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <BackgroundWrapper>
        <Overlay />
        <LogoWrapper onClick={() => navigate('/')}> <LogoImg src={logo} alt="CineNiche Logo" /> </LogoWrapper>
        <FormWrapper onSubmit={currentStep === RegisterStep.INITIAL ? handleInitialRegister : handleProfileComplete}>
          <Title>{currentStep === RegisterStep.INITIAL ? 'Create an Account' : 'Complete Your Profile'}</Title>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          {currentStep === RegisterStep.INITIAL ? (
            <>
              <Input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              <Input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
              <Input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input type="password" placeholder="Password (min. 10 characters)" value={password} onChange={e => setPassword(e.target.value)} required />
            </>
          ) : (
            <>
              <Input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} required />
              <Select value={gender} onChange={e => setGender(e.target.value)} required>
                <option value="" disabled>Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </Select>
              <Input type="tel" placeholder="Phone Number (optional)" value={phone} onChange={e => setPhone(e.target.value)} />
            </>
          )}

          <Button type="submit" disabled={loading}>{loading ? 'Processing...' : currentStep === RegisterStep.INITIAL ? 'Continue' : 'Complete Profile'}</Button>
          {currentStep === RegisterStep.INITIAL && (
            <Text>
              Already have an account?
              <LinkText onClick={() => navigate('/login')}> Sign in</LinkText>
            </Text>
          )}
        </FormWrapper>
      </BackgroundWrapper>
    </>
  );
};

export default RegisterPage;

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
`;

const BackgroundWrapper = styled.div`
  background-image: url(${bgImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1;
`;

const LogoWrapper = styled.div`
  position: absolute;
  top: 20px;
  left: 30px;
  z-index: 3;
  cursor: pointer;

  @media (max-width: 600px) {
    top: 16px;
    left: 16px;
  }
`;

const LogoImg = styled.img`
  width: 150px;
  height: auto;

  @media (max-width: 600px) {
    width: 100px;
  }
`;

const FormWrapper = styled.form`
  position: relative;
  z-index: 2;
  background-color: #f3ede5;
  padding: 60px 68px 40px;
  max-width: 450px;
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
`;

const Title = styled.h1`
  color: #000;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 28px;
`;

const Input = styled.input`
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ccc;
  color: #000;
  height: 50px;
  padding: 5px 20px;
  margin-bottom: 20px;
`;

const Select = styled.select`
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ccc;
  color: #000;
  height: 50px;
  padding: 5px 20px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background: #63b3d3;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  padding: 16px;
  border: 0;
  color: white;
  cursor: pointer;
  margin-bottom: 12px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover {
    background-color: #519abb;
  }
`;

const Text = styled.p`
  color: #8c8c8c;
  font-size: 16px;
  font-weight: 500;
`;

const LinkText = styled.span`
  color: #63b3d3;
  cursor: pointer;
  margin-left: 5px;
  text-decoration: underline;

  &:hover {
    color: #519abb;
  }
`;

const ErrorMessage = styled.div`
  background-color: #e50914;
  color: white;
  padding: 12px;
  font-size: 14px;
  margin-bottom: 16px;
  border-radius: 4px;
`;
