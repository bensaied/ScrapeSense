"use client";
import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);

  const handleStartClick = () => {
    setIsStarted(true);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.topHalf} ${isStarted ? styles.started : ""}`}>
        <Image
          src="/logo.png"
          alt="Logo"
          width={600}
          height={600}
          className={`${styles.logo} ${isStarted ? styles.logoStarted : ""}`}
        />
        {!isStarted && (
          <div className={styles.descriptionBox}>
            <p className={styles.description}>
              Welcome to ScrapeSense, your ultimate web scraping solution!
            </p>
            <br />
            <p className={styles.description}>
              Automates YouTube comment sentiment analysis.
            </p>
          </div>
        )}
        {!isStarted && (
          <button className={styles.startButton} onClick={handleStartClick}>
            &#9658; Start Scraping
          </button>
        )}
        {/* Form Box - appears after the logo translation */}
        {isStarted && (
          <div className={styles.formBox}>
            <input
              type="text"
              placeholder="Enter ngrok link"
              className={styles.formInput}
            />
            <input
              type="text"
              placeholder="Enter API v3 key"
              className={styles.formInput}
            />
            <button>Submit</button>
          </div>
        )}
      </div>
      <div className={styles.bottomHalf}></div>
    </div>
  );
}
