"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
} from "@mui/material";
import styles from "../src/app/css/embedding.module.css";
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
  // faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FaSpinner, FaBroom } from "react-icons/fa";
import Button from "@mui/material/Button";
import Papa from "papaparse";
import Image from "next/image";
import Link from "next/link";
import { Chart } from "chart.js/auto";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { useDemoData } from "@mui/x-data-grid-generator";

const PipilineEmbedding = () => {
  // Router
  const router = useRouter();
  const { ngrokUrl, apiKey } = router.query;
  const [tokenizedData, setTokenizedData] = useState(null);

  // Flask Status
  const [flaskStatus, setFlaskStatus] = useState(null);
  // Pipeline Stage Status (1-3)
  const [currentStage, setCurrentStage] = useState(1);
  // Step 1 - Select Method
  const [selectedMethod, setSelectedMethod] = useState("");
  const [description, setDescription] = useState("");

  // Step 2 - Configure & Execute Embedding
  const [loading, setLoading] = useState(false);
  const [resultFeatureExtraction, setResultFeatureExtraction] = useState(null);
  const [embeddedData, setEmbeddedData] = useState(null);

  // Step 3 - View Results
  const [nextPipeline, setNextPipeline] = useState(false);
  // Custom toolbar component
  const CustomToolbar = () => (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <GridToolbar />
    </Box>
  );
  const mapDataToRows = (rawData, embeddedData) => {
    const rows = [];

    if (rawData && Array.isArray(rawData) && rawData.length > 0) {
      rawData.forEach((dataItem, index) => {
        const { Comment } = dataItem;
        const uniqueId = `comment-${index + 1}`;

        // Map features from embeddedData for the current comment
        const features = embeddedData.features[index]; // Features corresponding to the comment

        // Create a row object
        const row = {
          id: uniqueId,
          Comment: Comment,
          ...features.reduce((acc, value, featureIndex) => {
            const featureName = embeddedData.feature_names[featureIndex]; // Feature name
            acc[featureName] = value; // Add feature value under its name
            return acc;
          }, {}),
        };

        rows.push(row);
      });
    } else {
      console.error("rawData does not contain a valid 'comments' array.");
    }

    return rows;
  };

  const rows = useMemo(() => {
    if (!tokenizedData || !embeddedData) return [];
    return mapDataToRows(tokenizedData, embeddedData);
  }, [tokenizedData, embeddedData]);

  const columns = useMemo(() => {
    if (!embeddedData || !embeddedData.feature_names) return [];

    // Define the base column for comments
    const baseColumns = [
      { field: "Comment", headerName: "Comment", width: 300 },
    ];

    // Add a column for each feature
    const featureColumns = embeddedData.feature_names.map((featureName) => ({
      field: featureName,
      headerName: featureName,
      width: 80, // Adjust the width as needed
    }));

    return [...baseColumns, ...featureColumns];
  }, [embeddedData]);

  const VISIBLE_FIELDS = useMemo(() => {
    if (!embeddedData || !embeddedData.feature_names) return ["Comment"];

    // Combine "Comment" with all feature names
    return ["Comment", ...embeddedData.feature_names];
  }, [embeddedData]);

  // Filter columns based on the visible fields
  const filteredColumns = useMemo(
    () => columns.filter((col) => VISIBLE_FIELDS.includes(col.field)),
    [columns, VISIBLE_FIELDS]
  );

  // Modify column properties, such as disabling filters for certain fields
  const modifiedColumns = useMemo(
    () =>
      filteredColumns.map((col) =>
        col.field === "specificFieldName" // Replace "specificFieldName" with the field you want to target
          ? { ...col, filterable: false }
          : col
      ),
    [filteredColumns]
  );

  // Handle Method Switching
  const handleMethodChange = (event) => {
    const method = event.target.value;
    setSelectedMethod(method);
    switch (method) {
      case "camel":
        setDescription(
          "CAMeL Tools: Specialized models for dialects like Egyptian, Levantine, and Gulf."
        );
        break;
      case "arabert":
        setDescription(
          "AraBERT: A fine-tuned BERT model designed for Arabic dialects."
        );
        break;
      case "fasttext":
        setDescription(
          "FastText: Captures subword-level info, useful for slang and rare words."
        );
        break;
      case "tfidf":
        setDescription(
          "TF-IDF: A traditional method for term importance and document similarity."
        );
        break;
      default:
        setDescription("");
    }
  };

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
    // Retrieve tokenizedData from sessionStorage
    const storedData = sessionStorage.getItem("tokenizedData");
    if (storedData) {
      setTokenizedData(JSON.parse(storedData));
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

  // Run the Embedding Word Method
  const handleRunEmbeddingMethod = async (e) => {
    // Get values from form elements
    const method = "tfidf";
    const maxFeatures = parseInt(
      document.getElementById("maxFeatures").value,
      10
    );
    const minDf = parseFloat(document.getElementById("minDf").value);
    const maxDf = parseFloat(document.getElementById("maxDf").value);

    console.log(maxFeatures, minDf, maxDf);

    // Validate parameters
    if (!maxFeatures || !minDf || !maxDf) {
      setResultFeatureExtraction(
        "All fields are required and must be valid numbers."
      );
      return;
    }

    try {
      setLoading(true);

      // Ensure the ngrok URL is correctly formatted
      const formattedNgrokUrl = ngrokUrl.endsWith("/")
        ? ngrokUrl
        : `${ngrokUrl}/`;

      // Prepare the tidyFeatures object to be sent to the backend
      const tidyFeatures = tokenizedData.map((item) => ({
        Comment: item.Comment, // Ensure each item has 'Comment'
        Label: item.Label, // Ensure each item has 'Label'
      }));

      // POST request to backend (Flask)
      const response = await fetch(`${formattedNgrokUrl}embedding-tfidf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method,
          maxFeatures,
          minDf,
          maxDf,
          tidyFeatures,
        }),
      });

      const data = await response.json();
      console.log("data-TFIDF", data);

      if (data.features) {
        setEmbeddedData(data);
        setCurrentStage(3);
        setResultFeatureExtraction(null);
      } else {
        setResultFeatureExtraction(
          data.error || "An error occurred during feature extraction."
        );
      }
    } catch (error) {
      setResultFeatureExtraction(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className={styles.pipelineTitle}>Pipeline 3: Word Embedding</h2>
        {/* Pipeline 3 */}
        <div className={styles.pipeline}>
          <div
            className={`${styles.stage} ${
              currentStage >= 1 ? styles.enabled : styles.disabled
            }`}
            data-title="Select Method"
          >
            1
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 2 ? styles.enabled : styles.disabled
            }`}
            data-title="Configure & Execute Embedding"
          >
            2
          </div>
          <div className={styles.connector}></div>

          <div
            className={`${styles.stage} ${
              currentStage >= 3 ? styles.enabled : styles.disabled
            }`}
            data-title="View Results"
          >
            3
          </div>
        </div>
        {!tokenizedData ? (
          <div className={styles.dataNotFound}>
            Tokenized data is missing! Please complete the{" "}
            <Link
              href={{
                pathname: "/clean",
                query: { ngrokUrl, apiKey },
              }}
            >
              <span className={styles.link} role="button">
                previous pipeline
              </span>{" "}
            </Link>
            to proceed with embedding.
          </div>
        ) : (
          <>
            {currentStage === 1 ? (
              <>
                <div className={styles.selectMethodContainer}>
                  <div className={styles.selectMethodTitle}>
                    Select Emmbedding Method
                  </div>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="embedding-method-label">
                      Choose a Method
                    </InputLabel>
                    <Select
                      labelId="embedding-method-label"
                      value={selectedMethod}
                      onChange={handleMethodChange}
                      label="Choose a Method"
                    >
                      <MenuItem value="camel">CAMeL Tools</MenuItem>
                      <MenuItem value="arabert">AraBERT</MenuItem>
                      <MenuItem value="fasttext">FastText</MenuItem>
                      <MenuItem value="tfidf">TF-IDF</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Display the description under the dropdown */}
                  {description && (
                    <div className={styles.inlineContainer}>
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className={styles.iconPadding}
                      />
                      <Typography
                        variant="body2"
                        className={styles.descriptionText}
                      >
                        {description}
                      </Typography>
                    </div>
                  )}
                </div>
                {selectedMethod && (
                  <button
                    title="Proceed to Step 2"
                    className={styles.proceedButtonStep1}
                    onClick={() => setCurrentStage(2)}
                  >
                    {" "}
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                )}
              </>
            ) : currentStage === 2 ? (
              /* Second Step: Set Parameters*/
              <>
                {selectedMethod === "tfidf" ? (
                  <div className={styles.tfidfConfigContainer}>
                    <h3 style={{ marginTop: "8px" }}>
                      Configure TF-IDF Parameters
                    </h3>
                    <p className={styles.methodDescription}>
                      Adjust the parameters below to customize how the TF-IDF
                      method processes your comments:
                    </p>
                    {resultFeatureExtraction && (
                      <div className={styles.methodError}>
                        ❌ {resultFeatureExtraction}
                      </div>
                    )}
                    <div className={styles.paramGroup}>
                      <label
                        htmlFor="maxFeatures"
                        className={styles.paramTitle}
                      >
                        Max Features:
                      </label>
                      <input
                        type="range"
                        id="maxFeatures"
                        name="maxFeatures"
                        min="100"
                        max="5000"
                        step="100"
                        defaultValue="1000"
                        onChange={(e) =>
                          (document.getElementById(
                            "maxFeaturesValue"
                          ).textContent = e.target.value)
                        }
                      />
                      <span
                        id="maxFeaturesValue"
                        className={styles.sliderValue}
                      >
                        1000
                      </span>

                      <span className={styles.paramDesc}>
                        Limit the number of top features (words) used for
                        analysis. (e.g., 1000).
                      </span>
                    </div>
                    <div className={styles.paramGroup}>
                      <label htmlFor="minDf" className={styles.paramTitle}>
                        Min Document Frequency (%):
                      </label>
                      <input
                        type="number"
                        id="minDf"
                        name="minDf"
                        min="0"
                        max="100"
                        step="0.01"
                        defaultValue="7"
                      />
                      <span className={styles.paramDesc}>
                        Exclude words that appear in fewer than this percentage
                        of documents. (e.g., 7%).
                      </span>
                    </div>
                    <div className={styles.paramGroup}>
                      <label htmlFor="maxDf" className={styles.paramTitle}>
                        Max Document Frequency (%):
                      </label>
                      <input
                        type="number"
                        id="maxDf"
                        name="maxDf"
                        min="50"
                        max="100"
                        step="1"
                        defaultValue="80"
                      />
                      <span className={styles.paramDesc}>
                        Exclude words that appear in more than this percentage
                        of documents. (e.g., 80%).
                      </span>
                    </div>
                  </div>
                ) : null}
                {loading && (
                  <div className={styles.loadingContainer}>
                    <FaSpinner className={styles.loadingIcon} />
                    <p>Please wait, processing your request...</p>
                  </div>
                )}
                {!loading && (
                  <div className={styles.buttonContainer}>
                    <button
                      title="Return to Step 1"
                      className={styles.proceedButton}
                      onClick={() => setCurrentStage(1)}
                    >
                      {" "}
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <button
                      title="Proceed to Step 3"
                      className={styles.proceedButton}
                      onClick={() => {
                        // setCurrentStage(3);
                        handleRunEmbeddingMethod();
                      }}
                    >
                      {" "}
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                )}
              </>
            ) : currentStage === 3 ? (
              <>
                {embeddedData && (
                  <>
                    <div className={styles.tablePreview}>
                      {/* <div className={styles.tableContainer}> */}
                      <div style={{ height: 280, width: "100%" }}>
                        <DataGrid
                          rows={rows}
                          columns={modifiedColumns}
                          slots={{ toolbar: CustomToolbar }}
                          loading={false}
                          density="compact"
                        />
                      </div>
                    </div>
                    <label>
                      <input
                        onClick={() => setNextPipeline(!nextPipeline)}
                        type="checkbox"
                        name="exportConfirmation"
                        required
                      />{" "}
                      I confirm that I have exported my data as a CSV file.
                    </label>
                  </>
                )}
                <div className={styles.buttonContainer}>
                  <button
                    title="Return to Step 2"
                    className={styles.proceedButton}
                    onClick={() => {
                      setCurrentStage(2);
                      setNextPipeline(false);
                    }}
                  >
                    {" "}
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                  {nextPipeline ? (
                    <button
                      title="Proceed to the fourth pipeline"
                      className={styles.proceedButton}
                    >
                      {" "}
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  ) : null}
                </div>
              </>
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

export default PipilineEmbedding;
