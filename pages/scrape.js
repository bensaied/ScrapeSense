"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../src/app/css/scrape.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import {
  // faCircleInfo,
  faCheckCircle,
  // faXmarkCircle,
  faTimesCircle,
  faArrowRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";

const PipilineScrape = () => {
  const router = useRouter();
  const { ngrokUrl, apiKey } = router.query;
  const [flaskStatus, setFlaskStatus] = useState(null);

  console.log("router.query", router.query);
  useEffect(() => {
    document.title = "ScrapeSense";
  }, []);
  useEffect(() => {
    if (router.query) {
      const checkFlaskReadiness = async (ngrokUrl) => {
        try {
          const formattedNgrokUrl = ngrokUrl.endsWith("/")
            ? ngrokUrl
            : `${ngrokUrl}/`;
          const response = await fetch(`${formattedNgrokUrl}health`);
          if (response.ok) {
            setFlaskStatus(true);
          } else {
            setFlaskStatus(false);
          }
        } catch (error) {
          setFlaskStatus(false);
        }
      };
      checkFlaskReadiness(router.query.ngrokUrl);
    }
  }, [router.query]);

  const checkFlaskReadiness = async (ngrokUrl) => {
    try {
      const formattedNgrokUrl = ngrokUrl.endsWith("/")
        ? ngrokUrl
        : `${ngrokUrl}/`;
      const response = await fetch(`${formattedNgrokUrl}health`);
      if (response.ok) {
        setFlaskStatus(true);
      } else {
        setFlaskStatus(false);
      }
    } catch (error) {
      setFlaskStatus(false);
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Link
          href={{
            pathname: "/",
          }}
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={400}
            height={400}
            className={`${styles.logo} }`}
          />
        </Link>
      </div>
      <div className={styles.pipelineContainer}>
        <h2 className={styles.pipelineTitle}>
          Pipeline: Scraping Workflow Overview
        </h2>
        <div className={styles.pipeline}>
          <div className={`${styles.stage}`} data-title="Setup Model Features">
            1
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${styles.disabled}`}
            data-title="Stage 2"
          >
            2
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${styles.disabled}`}
            data-title="Stage 3"
          >
            3
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${styles.disabled}`}
            data-title="Stage 4"
          >
            4
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${styles.disabled}`}
            data-title="Stage 5"
          >
            5
          </div>
        </div>
        <div className={styles.formBox}>
          <strong>Complete the modal Form</strong>{" "}
          <input type="text" placeholder="Query" className={styles.formInput} />
          <input
            type="text"
            placeholder="Max Results"
            className={styles.formInput}
          />
          <input
            type="text"
            placeholder="Enter ngrok URL"
            className={styles.formInput}
          />
        </div>
        <div className={styles.statusContainer}>
          {flaskStatus === true ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={styles.successIcon}
              />
              <span className={styles.statusText}>Flask app: Running</span>
            </div>
          ) : flaskStatus === false ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <FontAwesomeIcon
                icon={faTimesCircle}
                className={styles.errorIcon}
              />
              <span className={styles.statusText}>Flask app: Not running</span>
              <Link
                href={{
                  pathname: "/",
                }}
              >
                <FontAwesomeIcon
                  title="Return to Home"
                  icon={faArrowRotateLeft}
                  className={styles.returnIcon}
                />
                <span className={styles.returnText}></span>
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.bottomIcons}>
        <a
          href="https://github.com/bensaied/ScrapeSense"
          title="GitHub Repository"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faGithub}
            className={`${styles.icon} ${styles.github}`}
          />
        </a>
        <a
          href="https://linkedin.com/in/bensaied"
          title="LinkedIn Profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faLinkedin}
            className={`${styles.icon} ${styles.linkedin}`}
          />
        </a>
      </div>
    </div>
  );
};

export default PipilineScrape;
