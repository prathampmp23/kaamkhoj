import React from "react";
import { Container } from "react-bootstrap";

const Footer = ({ language = "hi" }) => {
  // Translation content
  const content = {
    hi: {
      rights: "सर्वाधिकार सुरक्षित",
      companyName: "कामखोज",
    },
    en: {
      rights: "All Rights Reserved",
      companyName: "KaamKhoj",
    },
  };

  return (
    <footer className="bg-secondary-subtle text-black text-start p-2">
      <Container className="d-flex justify-content-between gap-4">
        <div>
          <p>
            <b>&copy; {new Date().getFullYear()} {content[language].companyName}.</b>{" "}
            {content[language].rights}.
          </p>
        </div>
        <div>
          <p>
            <b>Co-Founders </b>
            <br />{" "}
            <p className="text-primary">
              Manthan, Pratham, Rishabh, Yachin, Aashish
            </p>
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
