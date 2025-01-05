"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import ChartComponent from "../src/app/chart";
import TableComponent from "../src/app/table";

import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
} from "@mui/material";
import styles from "../src/app/css/modeling.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import {
  faCircleInfo,
  faCheckCircle,
  // faXmarkCircle,
  faTimesCircle,
  faArrowRotateLeft,
  faArrowRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FaSpinner } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { useDemoData } from "@mui/x-data-grid-generator";

const PipilineModeling = () => {
  // Router
  const router = useRouter();
  const { ngrokUrl, apiKey } = router.query;
  // States From Local Storage
  const [cleanedData, setCleanedData] = useState(null);
  const [tokenizedData, setTokenizedData] = useState(null);
  const [scrapedDataStored, setScrapedData] = useState(null);
  const [embeddedData, setEmbeddedData] = useState(null);
  const [embeddingMethodStored, setEmbeddingMethod] = useState(null);
  // DATA Metrics
  const [scrapedDataStoredComments, setScrapedDataStoredComments] =
    useState(null);
  const [cleanedDataStoredComments, setCleanedDataStoredComments] =
    useState(null);
  const [distinctLabelsCount, setDistinctLabelsCount] = useState(0);
  const [embeddingMethodValue, setEmbeddingMethodValue] = useState(null);
  //TF-IDF Method
  const [featureNumber, setFeatureNumber] = useState(null);
  const [embeddingCommentsNumber, setEmbeddingCommentsNumber] = useState(null);

  // Flask Status
  const [flaskStatus, setFlaskStatus] = useState(null);

  // Pipeline Stage Status (1-6)
  const [currentStage, setCurrentStage] = useState(1);

  useEffect(() => {
    document.title = "ScrapeSense";
  }, []);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("display", "flex");
      document.body.style.setProperty("flex-direction", "column");
      document.body.style.setProperty("margin", "0");
      document.body.style.setProperty("padding", "0");
      document.body.style.setProperty("min-height", "100vh");
      document.body.style.setProperty("margin-top", "0");
    }
  }, []);
  useEffect(() => {
    // Retrieve embeddedMethod from sessionStorage
    const storedEmbeddedMethod = sessionStorage.getItem("embeddingMethod");
    if (storedEmbeddedMethod) {
      setEmbeddingMethod(storedEmbeddedMethod);
    }

    // Retrieve embeddedData from sessionStorage
    const storedEmbeddedData = sessionStorage.getItem("embeddedData");
    if (storedEmbeddedData) {
      setEmbeddedData(JSON.parse(storedEmbeddedData));
    }

    // Retrieve tokenizedData from sessionStorage
    const storedTokenizedData = sessionStorage.getItem("tokenizedData");
    if (storedTokenizedData) {
      setTokenizedData(JSON.parse(storedTokenizedData));
    }

    // Retrieve cleanedData from sessionStorage
    const storedCleanedData = sessionStorage.getItem("cleanedData");
    if (storedCleanedData) {
      setCleanedData(JSON.parse(storedCleanedData));
    }
    // Retrieve scrapedData from sessionStorage
    const storedScrapedData = sessionStorage.getItem("scrapedData");
    if (storedScrapedData) {
      setScrapedData(JSON.parse(storedScrapedData));
    }
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

  // Retrieve Data Metrics
  useEffect(
    () => {
      if (scrapedDataStored && Array.isArray(scrapedDataStored.comments)) {
        setScrapedDataStoredComments(scrapedDataStored.comments.length);
      }
      if (Array.isArray(cleanedData)) {
        setCleanedDataStoredComments(cleanedData.length);
        // Find distinct labels in cleanedData
        const labels = new Set(cleanedData.map((item) => item.Label));
        setDistinctLabelsCount(labels.size);
      }
      if (embeddingMethodStored === "tfidf" && embeddedData) {
        if (Array.isArray(embeddedData.feature_names)) {
          setFeatureNumber(embeddedData.feature_names.length);
        }
        if (Array.isArray(embeddedData.features)) {
          setEmbeddingCommentsNumber(embeddedData.features.length);
        }
        setEmbeddingMethodValue("TF-IDF");
      } else if (embeddingMethodStored === "arabert") {
        if (Array.isArray(embeddedData) && embeddedData.length > 0) {
          const embeddedCommentsLength = embeddedData.length;
          setEmbeddingCommentsNumber(embeddedCommentsLength);

          if (Array.isArray(embeddedData[0]) && embeddedData[0].length > 0) {
            const featuresLength = embeddedData[0].length;
            setFeatureNumber(featuresLength);
          } else {
            setFeatureNumber(0);
          }
        } else {
          setEmbeddingCommentsNumber(0);
          setFeatureNumber(0);
        }
        setEmbeddingMethodValue("AraBERT");
      } else {
        if (Array.isArray(embeddedData) && embeddedData.length > 0) {
          const embeddedCommentsLength = embeddedData.length;
          setEmbeddingCommentsNumber(embeddedCommentsLength);

          if (Array.isArray(embeddedData[0]) && embeddedData[0].length > 0) {
            const featuresLength = embeddedData[0].length;
            setFeatureNumber(featuresLength);
          } else {
            setFeatureNumber(0);
          }
        } else {
          setEmbeddingCommentsNumber(0);
          setFeatureNumber(0);
        }
        setEmbeddingMethodValue("FastText");
      }
    },
    [scrapedDataStored],
    [cleanedData]
  );

  const scrapedData = scrapedDataStoredComments || "NULL";
  const invalidValues =
    scrapedDataStoredComments - cleanedDataStoredComments || "NULL";
  const cleanedComments = cleanedDataStoredComments | "NULL";
  const cleanedLabels = distinctLabelsCount || "NULL";
  const embeddingComments = embeddingCommentsNumber || "NULL";
  const embeddingMethod = embeddingMethodValue || "NULL";
  let embeddingFeatures = featureNumber || "0";
  if (embeddingMethod === "TF-IDF") {
    embeddingFeatures += " words";
  }

  // Logic to compare embeddingComments and cleanedComments
  const isEmbeddingEqualToCleaned = embeddingComments === cleanedComments;

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        {/* <Link
                href={{
                  pathname: "/",
                }}
              > */}
        <Image
          title="ScrapeSense"
          src="/logo.png"
          alt="Logo"
          width={400}
          height={400}
          className={`${styles.logo} }`}
        />
        {/* </Link> */}
      </div>
      <div className={styles.pipelineContainer}>
        <h2 className={styles.pipelineTitle}>
          Pipeline 4: Modeling and Deployment
        </h2>
        {/* Pipeline 3 */}
        <div className={styles.pipeline}>
          <div
            className={`${styles.stage} ${
              currentStage >= 1 ? styles.enabled : styles.disabled
            }`}
            data-title="Data Monitoring and Streamlining"
          >
            1
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 2 ? styles.enabled : styles.disabled
            }`}
            data-title="Model & Data Partitioning"
          >
            2
          </div>

          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 3 ? styles.enabled : styles.disabled
            }`}
            data-title="Model Training"
          >
            3
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 4 ? styles.enabled : styles.disabled
            }`}
            data-title="Model Testing and Evaluation"
          >
            4
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 6 ? styles.enabled : styles.disabled
            }`}
            data-title=" Model Deployment"
          >
            6
          </div>
        </div>

        {!embeddedData ? (
          <div className={styles.dataNotFound}>
            Embedded data is missing! Please complete the{" "}
            <Link
              href={{
                pathname: "/embedding",
                query: { ngrokUrl, apiKey },
              }}
            >
              <span className={styles.link} role="button">
                previous pipeline
              </span>{" "}
            </Link>
            to proceed with modeling.
          </div>
        ) : (
          <>
            {currentStage === 1 ? (
              <>
                <div className={styles.monitorContainer}>
                  {" "}
                  <div className={styles.chartContainer}>
                    <h2 className={styles.chartTitle}>Cleaned Data Overview</h2>

                    <ChartComponent data={cleanedData} />
                  </div>
                  <div className={styles.tableContainer}>
                    <h2 className={styles.chartTitle}>
                      Data Processing Metrics
                    </h2>
                    <TableComponent
                      scrapedData={scrapedData}
                      invalidValues={invalidValues}
                      cleanedComments={cleanedComments}
                      cleanedLabels={cleanedLabels}
                      embeddingComments={embeddingComments}
                      embeddingFeatures={embeddingFeatures}
                      embeddingMethod={embeddingMethod}
                      isEmbeddingEqualToCleaned={isEmbeddingEqualToCleaned}
                    />{" "}
                  </div>
                </div>
                <div className={styles.buttonContainer}>
                  <Link
                    href={{
                      pathname: "/embedding",
                      query: { ngrokUrl, apiKey },
                    }}
                  >
                    <button
                      title="Go back to the previous pipeline"
                      className={styles.proceedButtonStep1}
                    >
                      {" "}
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                  </Link>
                  <button
                    title="Proceed to Step 2"
                    className={styles.proceedButtonStep1}
                    onClick={() => setCurrentStage(2)}
                  >
                    {" "}
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              </>
            ) : currentStage === 2 ? (
              <></>
            ) : currentStage === 3 ? (
              <></>
            ) : null}
          </>
        )}
        <div className={styles.statusFlask}>
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
    </div>
  );
};
export default PipilineModeling;
