import React from "react";

// Reusable components with inline styles for email compatibility

const containerStyle: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  margin: "0 auto",
  padding: "20px",
  width: "100%",
  maxWidth: "600px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "32px",
  margin: "0 auto",
  width: "100%",
};

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "24px",
};

const headingStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1f2937",
  margin: "16px 0",
};

const textStyle: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#4b5563",
  margin: "16px 0",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#007bff",
  border: "none",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "12px 24px",
  textAlign: "center",
  textDecoration: "none",
  display: "inline-block",
  margin: "16px 0",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  marginTop: "24px",
  color: "#9ca3af",
  fontSize: "12px",
};

// --- Reusable Components ---

const EmailContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div style={containerStyle}>{children}</div>;

const EmailCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={cardStyle}>{children}</div>
);

const EmailHeader: React.FC<{ appName: string }> = ({ appName }) => (
  <div style={headerStyle}>
    {/* You can replace this with your actual logo */}
    <h1 style={{ ...headingStyle, fontSize: "28px", margin: 0 }}>{appName}</h1>
  </div>
);

const EmailButton: React.FC<{ href: string; text: string }> = ({
  href,
  text,
}) => (
  <a href={href} style={buttonStyle} target="_blank" rel="noopener noreferrer">
    {text}
  </a>
);

const EmailFooter: React.FC<{ appName: string }> = ({ appName }) => (
  <div style={footerStyle}>
    <p>&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
    <p>
      If you did not request this email, please ignore it.
    </p>
  </div>
);

// --- Main Email Template ---

interface ResetPasswordEmailProps {
  appName?: string;
  userName?: string;
  resetLink?: string;
}

export const ResetPasswordEmailTemplate: React.FC<ResetPasswordEmailProps> = ({
  appName = "Your App",
  userName = "User",
  resetLink = "#",
}) => {
  return (
    <EmailContainer>
      <EmailCard>
        <EmailHeader appName={appName} />
        <h2 style={headingStyle}>Password Reset Request</h2>
        <p style={textStyle}>Hello {userName},</p>
        <p style={textStyle}>
          We received a request to reset the password for your account. You can
          reset your password by clicking the button below:
        </p>
        <div style={{ textAlign: "center" }}>
          <EmailButton href={resetLink} text="Reset Your Password" />
        </div>
        <p style={textStyle}>
          If you don&apos;t want to change your password, you can ignore this
          email.
        </p>
        <p style={textStyle}>
          Thanks,
          <br />
          The {appName} Team
        </p>
      </EmailCard>
      <EmailFooter appName={appName} />
    </EmailContainer>
  );
};

export default ResetPasswordEmailTemplate;
