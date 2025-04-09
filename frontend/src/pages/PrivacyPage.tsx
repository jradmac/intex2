import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import logo from '../images/CineNicheLogo.png';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <GlobalStyle />
      <PageWrapper>
        <Header>
          <LogoImg src={logo} alt="CineNiche Logo" onClick={() => navigate('/home')} />
          <HeaderRight>
            <NavButton onClick={() => navigate('/home')}>Home</NavButton>
          </HeaderRight>
        </Header>

        <ContentWrapper>
          <PageTitle>Privacy Policy & Terms of Use</PageTitle>

          <Section>
            <Paragraph>
              Welcome to CineNiche. This Privacy Policy outlines how we collect, use, and protect your personal information. By using
              CineNiche, you agree to these terms.
            </Paragraph>
            <Paragraph>
              We are committed to protecting your privacy. If you have any questions about how we handle your information, feel free to
              contact us at <a href="mailto:privacy@cineniche.com">privacy@cineniche.com</a>.
            </Paragraph>
          </Section>

          <Section>
            <SectionHeading>1. Information We Collect</SectionHeading>
            <Paragraph>
              We collect basic account information like your name, email, age, and gender. This helps us personalize your movie
              recommendations.
            </Paragraph>
            <Paragraph>
              We also gather technical details like your IP address, browser type, and device information to ensure a secure and optimized
              experience.
            </Paragraph>
            <Paragraph>
              Additionally, we monitor how you interact with CineNiche—such as which pages you visit or what you watch—to improve our
              features and recommendations.
            </Paragraph>
          </Section>

          <Section>
            <SectionHeading>2. Authentication & Security</SectionHeading>
            <Paragraph>
              We use <strong>Stytch</strong> for authentication. Your login credentials are never stored on our servers—only secure tokens
              are used to keep you logged in.
            </Paragraph>
          </Section>

          <Section>
            <SectionHeading>3. How We Use Your Data</SectionHeading>
            <Paragraph>
              We use your data to provide you with relevant movie recommendations, improve the performance of our platform, and protect
              against fraud or unauthorized access.
            </Paragraph>
          </Section>

          <Section>
            <SectionHeading>4. Your Rights</SectionHeading>
            <Paragraph>
              You can access or update your personal information at any time through your profile settings. If you'd like to delete your
              account, contact us and we’ll handle it promptly.
            </Paragraph>
          </Section>

          <Section>
            <SectionHeading>5. Contact Us</SectionHeading>
            <Paragraph>
              For any privacy-related questions, reach out to our team at{' '}
              <a href="mailto:support@cineniche.com">support@cineniche.com</a>.
            </Paragraph>
          </Section>
        </ContentWrapper>

        <Footer>&copy; {new Date().getFullYear()} CineNiche. All rights reserved.</Footer>
      </PageWrapper>
    </>
  );
};

export default PrivacyPage;

// ---------- Styled Components ----------
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow-x: hidden;
    font-family: 'Helvetica Neue', sans-serif;
    background-color: #141414;
    color: #f1f1f1;
  }
  ::-webkit-scrollbar { width: 0px; background: transparent; }
  * { scrollbar-width: none; }
  body { -ms-overflow-style: none; }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NavButton = styled.button`
  background: transparent;
  color: white;
  border: 1px solid white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  &:hover { background: #333; }
`;

const LogoImg = styled.img`
  height: 40px;
  width: auto;
  cursor: pointer;
  @media (max-width: 600px) { height: 30px; }
`;

const ContentWrapper = styled.main`
  max-width: 800px;
  margin: 60px auto;
  padding: 0 24px;
`;

const PageTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 40px;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionHeading = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #f1f1f1;
`;

const Paragraph = styled.p`
  font-size: 1.05rem;
  margin-bottom: 18px;
  color: #ccc;
  line-height: 1.7;
  a {
    color: #bbb;
    text-decoration: underline;
  }
`;

const Footer = styled.footer`
  text-align: left;
  padding: 20px 40px;
  background-color: #141414;
  font-size: 0.9rem;
  color: #888;
  margin-top: auto;
`;
