import React from "react";

const styles = {
  page: {
    margin: "0 auto",
    padding: "48px 40px",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#1a1a1a",
    backgroundColor: "#fff",
  },
  h1: {
    fontSize: "28px",
    fontWeight: "700",
    lineHeight: "1.2",
    marginBottom: "16px",
    marginTop: "0",
    letterSpacing: "-0.3px",
  },
  metaBlock: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#555",
    marginBottom: "8px",
  },
  contactBlock: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#333",
    marginTop: "16px",
    marginBottom: "0",
  },
  hr: {
    border: "none",
    borderTop: "1px solid #ddd",
    margin: "32px 0",
  },
  h2: {
    fontSize: "20px",
    fontWeight: "700",
    lineHeight: "1.3",
    marginTop: "0",
    marginBottom: "12px",
    letterSpacing: "-0.2px",
  },
  h3: {
    fontSize: "17px",
    fontWeight: "600",
    lineHeight: "1.3",
    marginTop: "24px",
    marginBottom: "10px",
  },
  p: {
    fontSize: "16px",
    lineHeight: "1.7",
    marginTop: "0",
    marginBottom: "12px",
    color: "#1a1a1a",
  },
  ul: {
    paddingLeft: "24px",
    marginTop: "4px",
    marginBottom: "12px",
  },
  li: {
    fontSize: "16px",
    lineHeight: "1.7",
    marginBottom: "4px",
    color: "#1a1a1a",
  },
  section: {
    marginBottom: "0",
  },
};

export default function TermCondition() {
  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Terms of Use</h1>

      <p style={styles.metaBlock}>
        <strong>Example Rides</strong> · Placeholder document
      </p>

      <p style={styles.p}>
        This page is placeholder content for a demo project. It is not a real
        agreement and does not describe the terms of any real service.
      </p>

      <hr style={styles.hr} />

      <div style={styles.section}>
        <h2 style={styles.h2}>1. Using the platform</h2>
        <p style={styles.p}>
          Describe who can use the service and the rules for rider and driver
          accounts.
        </p>

        <h2 style={styles.h2}>2. Payments</h2>
        <p style={styles.p}>
          Describe how fares, fees, payouts and promotions work.
        </p>

        <h2 style={styles.h2}>3. Safety and conduct</h2>
        <p style={styles.p}>
          Describe expected behavior and when accounts can be suspended.
        </p>

        <h2 style={styles.h2}>4. Liability</h2>
        <p style={styles.p}>
          Describe warranties, limits of liability and how disputes are handled.
        </p>

        <h2 style={styles.h2}>5. Contact</h2>
        <p style={styles.contactBlock}>support@example.com</p>
      </div>
    </div>
  );
}
