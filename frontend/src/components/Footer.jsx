import React from "react";
import { Container } from "react-bootstrap";

const Footer = ({ language = "hi" }) => {
  // Translation content
  const content = {
    hi: {
      rights: "सर्वाधिकार सुरक्षित",
      companyName: "कामखोज"
    },
    en: {
      rights: "All Rights Reserved",
      companyName: "KaamKhoj"
    }
  };

  return (
    <footer className="bg-dark text-white text-center p-3">
      <Container>
        <p>&copy; {new Date().getFullYear()} {content[language].companyName}. {content[language].rights}.</p>
      </Container>
    </footer>
  );
};

export default Footer;
