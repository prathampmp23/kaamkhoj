import React from "react";
import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="bg-dark text-white text-center p-3">
      <Container>
        <p>&copy; {new Date().getFullYear()} Kaamkhoj. All Rights Reserved.</p>
      </Container>
    </footer>
  );
};

export default Footer;
