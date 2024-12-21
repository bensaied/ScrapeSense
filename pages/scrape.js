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
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { FaSpinner } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

const PipilineScrape = () => {
  const router = useRouter();
  const { ngrokUrl, apiKey } = router.query;
  const [flaskStatus, setFlaskStatus] = useState(null);
  //FormBox: Search Videos
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState();
  const [loading, setLoading] = useState(false);
  const [resultForm, setResultForm] = useState(null);
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

  //HandleSubmitForm: Search Videos
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!query || !maxResults) {
      // setStatus("Failed");
      setResultForm(
        "Please complete the form. Query and Max Videos Results cannot be empty."
      );
      return;
    }

    // POST API Form Search Videos to Flask Endpoint
    const formattedNgrokUrl = ngrokUrl.endsWith("/")
      ? ngrokUrl
      : `${ngrokUrl}/`;

    try {
      setLoading(true);

      const response = await fetch(`${formattedNgrokUrl}searchVideos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          max_results: maxResults,
          developerKey: apiKey,
        }),
      });

      const data = await response.json();
      console.log("data :", data);
      if (response.ok) {
        // setStatus("Success");
        setResultForm("Your query has been submitted successfully.");
      } else {
        // setStatus("Failed");
        setResultForm("Problem submitting your query. Please try again later.");
      }
    } catch (error) {
      //   console.error("Error:", error);
      // setStatus("Failed");
      setResultForm(
        "Please complete the form. Query and Max Videos Results cannot be empty."
      );
    } finally {
      setLoading(false); // End loading after the response is received or if there's an error
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
          Pipeline 1: YouTube Comments Data Scraping
        </h2>
        {/* Pipeline 1 */}
        <div className={styles.pipeline}>
          <div className={`${styles.stage}`} data-title="Search Videos">
            1
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${styles.disabled}`}
            data-title="Fetch Video Details"
          >
            2
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${styles.disabled}`}
            data-title="Extract Comments"
          >
            3
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${styles.disabled}`}
            data-title="Aggregate Comments"
          >
            4
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${styles.disabled}`}
            data-title="Export Dataset"
          >
            5
          </div>
        </div>
        {/* First Step: Search Videos */}
        <div className={styles.formBox}>
          <strong>Complete the Form</strong>{" "}
          <input
            type="text"
            placeholder="Query"
            className={styles.formInput}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Videos Results"
            className={styles.formInput}
            value={maxResults}
            onChange={(e) => setMaxResults(e.target.value)}
          />
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.proceedButton} onClick={handleSubmitForm}>
            {" "}
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
          <br />
        </div>
        {loading && (
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.loadingIcon} />
            <p>Loading... Please wait while we process your query.</p>
          </div>
        )}

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
