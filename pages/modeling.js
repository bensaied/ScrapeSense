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
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";

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
  const [embeddedDataLabeled, setEmbeddedDataLabeled] = useState(null);
  const [embeddingMethodStored, setEmbeddingMethod] = useState(null);
  // Flask Status
  const [flaskStatus, setFlaskStatus] = useState(null);
  // Pipeline Stage Status (1-5)
  const [currentStage, setCurrentStage] = useState(1);

  // FIRST STEP : DATA Metrics
  const [scrapedDataStoredComments, setScrapedDataStoredComments] =
    useState(null);
  const [cleanedDataStoredComments, setCleanedDataStoredComments] =
    useState(null);
  const [distinctLabelsCount, setDistinctLabelsCount] = useState(0);
  const [embeddingMethodValue, setEmbeddingMethodValue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TF-IDF Method
  const [featureNumber, setFeatureNumber] = useState(null);
  const [embeddingCommentsNumber, setEmbeddingCommentsNumber] = useState(null);

  // SECOND STEP : Monitor & Data Partitioning
  const [selectedPartition, setSelectedPartition] = useState("");
  const setPartition = (event) => {
    setSelectedPartition(event.target.value);
  };
  const [loading, setLoading] = useState(false);
  const [ResultModelTraining, setResultModelTraining] = useState(null);
  const [ModelTrainingResults, setModelTrainingResults] = useState(null);

  // FastText Hyperparameters
  const [epoch, setEpoch] = useState(3);
  const [lr, setLr] = useState(0.1);
  const [wordNgrams, setWordNgrams] = useState(1);
  const handleEpochChange = (event) => {
    setEpoch(event.target.value);
  };
  const handleLrChange = (event) => {
    setLr(event.target.value);
  };
  const handleWordNgramsChange = (event) => {
    setWordNgrams(event.target.value);
  };

  // AraBERT Hyperparameters
  const [batchSize, setBatchSize] = useState(16);
  const handleBatchSizeChange = (e) => setBatchSize(e.target.value);
  // Step 3 - Save Model
  const [modelTfIdf, setModelTfIdf] = useState(null);
  const [modelFastText, setModelFastText] = useState(null);
  const [modelAraBert, setModelAraBert] = useState(null);

  // useEffect
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
    // Retrieve embeddedDataLabeled from sessionStorage
    const storedEmbeddedDataLabeled = sessionStorage.getItem(
      "embeddedDataLabeled"
    );
    if (storedEmbeddedDataLabeled) {
      setEmbeddedDataLabeled(JSON.parse(storedEmbeddedDataLabeled));
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
          setFeatureNumber(300);
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

  // Modal Warning
  // Function to open the modal
  const handleOpenModal = () => {
    if (!isEmbeddingEqualToCleaned) {
      setIsModalOpen(true);
    } else {
      setCurrentStage(2);
    }
  };
  // Function to handle the "Proceed" button click
  const handleProceed = () => {
    setIsModalOpen(false);
    setCurrentStage(2);
  };

  // Modeling - Naive Bayes
  const handleRunTFIDFModelTraining = async (e) => {
    if (!embeddedData || !cleanedData || !selectedPartition) {
      setResultModelTraining(
        "Embedded data, cleaned data, and partition are required."
      );
      return;
    }
    const formattedNgrokUrl = ngrokUrl.endsWith("/")
      ? ngrokUrl
      : `${ngrokUrl}/`;

    try {
      setLoading(true);

      const response = await fetch(`${formattedNgrokUrl}train-tfidf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeddedData,
          cleanedData,
          partition: selectedPartition,
        }),
      });

      const data = await response.json();
      console.log("data: ", data.model);
      setModelTfIdf(data.model);
      if (data.accuracy) {
        setModelTrainingResults(data);
        setResultModelTraining(null);
        setCurrentStage(3);
      } else {
        setResultModelTraining(
          data.error || "An error occurred during model training."
        );
      }
    } catch (error) {
      setResultModelTraining(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Modeling - FastText
  const handleRunFastTextModelTraining = async (e) => {
    if (!embeddedData || !embeddedDataLabeled || !selectedPartition) {
      setResultModelTraining(
        "Embedded data, embeddedDataLabeled, and partition are required."
      );
      return;
    }

    const formattedNgrokUrl = ngrokUrl.endsWith("/")
      ? ngrokUrl
      : `${ngrokUrl}/`;

    try {
      setLoading(true);

      const response = await fetch(`${formattedNgrokUrl}train-fasttext`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeddedData,
          embeddedDataLabeled,
          partition: selectedPartition,
          hyperparameters: {
            epoch: parseInt(epoch, 10),
            lr: parseFloat(lr),
            wordNgrams: parseInt(wordNgrams, 10),
          },
        }),
      });

      const data = await response.json();
      console.log("data: ", data);

      if (data.accuracy) {
        setModelTrainingResults(data);
        setResultModelTraining(null);
        setCurrentStage(3);
      } else {
        setResultModelTraining(
          data.error || "An error occurred during model training."
        );
      }
    } catch (error) {
      setResultModelTraining(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Modeling - AraBERT
  const handleRunAraBERTModelTraining = async (e) => {
    if (!embeddedData || !cleanedData || !selectedPartition) {
      setResultModelTraining(
        "Embedded data, cleaned data, and partition are required."
      );
      return;
    }

    const formattedNgrokUrl = ngrokUrl.endsWith("/")
      ? ngrokUrl
      : `${ngrokUrl}/`;

    try {
      setLoading(true);

      const response = await fetch(`${formattedNgrokUrl}train-arabert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeddedData,
          cleanedData,
          partition: selectedPartition,
          hyperparameters: {
            epoch: parseInt(epoch, 10),
            lr: parseFloat(lr),
            batchSize: parseInt(batchSize, 10),
          },
        }),
      });

      const data = await response.json();
      if (data.accuracy) {
        setModelTrainingResults(data);
        setResultModelTraining(null);
        setCurrentStage(3);
      } else {
        setResultModelTraining(
          data.error || "An error occurred during model training."
        );
      }
    } catch (error) {
      setResultModelTraining(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h2>Warning!</h2>
            </div>
            <p className={styles.warningMessage}>
              Only{" "}
              <span
                style={{
                  color: "orange",
                  fontWeight: "bold",
                  textDecoration: "underline",
                }}
              >
                {" "}
                {embeddingComments}
              </span>{" "}
              embedded comments will be used out of a total of{" "}
              <span style={{ color: "#007bff", fontWeight: "bold" }}>
                {cleanedComments}
              </span>{" "}
              cleaned comments.{" "}
              <span style={{ display: "block", marginTop: "10px" }}>
                Are you sure you want to proceed?
              </span>
            </p>

            <div className={styles.modalButtons}>
              <Link
                href={{
                  pathname: "/embedding",
                  query: { ngrokUrl, apiKey },
                }}
              >
                <button className={styles.returnButton}>
                  ↩️ Return to Embedding
                </button>
              </Link>

              <button onClick={handleProceed} className={styles.proceedButton}>
                🚀 Proceed to Modeling
              </button>
            </div>
          </div>
        </div>
      )}

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
            data-title="Model Training and Evaluation"
          >
            3
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
                    <h2 className={styles.chartTitle}>
                      Embedded Data Overview : {embeddingComments} Comments
                    </h2>

                    <ChartComponent data={embeddedDataLabeled} />
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
                    onClick={() => handleOpenModal()}
                  >
                    {" "}
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              </>
            ) : currentStage === 2 ? (
              <>
                {embeddingMethodStored === "tfidf" ? (
                  <div className={styles.selectMethodContainer}>
                    <span className={styles.modelTitle}>
                      Model: Naive Bayes
                    </span>
                    <br />
                    {ResultModelTraining && (
                      <span
                        style={{
                          color: "red",
                          fontWeight: "bold",
                          fontSize: "16px",
                          backgroundColor: "#ffe6e6",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          border: "1px solid red",
                          display: "inline-block",
                        }}
                      >
                        {ResultModelTraining}
                      </span>
                    )}

                    <div className={styles.selectMethodTitle}>
                      Select Data Partitioning
                    </div>

                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="model-partition">Partition</InputLabel>
                      <Select
                        labelId="model-partition"
                        value={selectedPartition}
                        onChange={setPartition}
                        label="Choose a Model"
                      >
                        <MenuItem value="80-20">80% - 20%</MenuItem>
                        <MenuItem value="70-30">70% - 30%</MenuItem>
                      </Select>
                    </FormControl>

                    <div className={styles.inlineContainer}>
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className={styles.iconPadding}
                      />
                      <Typography
                        variant="body2"
                        className={styles.descriptionText}
                      >
                        Naive Bayes is a family of probabilistic algorithms
                        based on Bayes' theorem with a strong independence
                        assumption between the features.
                      </Typography>
                    </div>
                  </div>
                ) : embeddingMethodStored === "arabert" ? (
                  <div className={styles.selectMethodContainer}>
                    <span className={styles.modelTitle}>Model: AraBERT</span>
                    <br />
                    {ResultModelTraining && (
                      <span
                        style={{
                          color: "red",
                          fontWeight: "bold",
                          fontSize: "16px",
                          backgroundColor: "#ffe6e6",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          border: "1px solid red",
                          display: "inline-block",
                        }}
                      >
                        {ResultModelTraining}
                      </span>
                    )}
                    <div className={styles.selectMethodTitle}>
                      Select Data Partitioning
                    </div>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="model-partition">Partition</InputLabel>
                      <Select
                        labelId="model-partition"
                        value={selectedPartition}
                        onChange={setPartition}
                        label="Choose a Model"
                      >
                        <MenuItem value="80-20">80% - 20%</MenuItem>
                        <MenuItem value="70-30">70% - 30%</MenuItem>
                      </Select>
                    </FormControl>

                    {/* <div className={styles.inlineContainer}>
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className={styles.iconPadding}
                      />
                      <Typography
                        variant="body2"
                        className={styles.descriptionText}
                      >
                 
                      </Typography>
                    </div> */}

                    <div className={styles.selectMethodTitle}>
                      Adjust Hyperparameters
                    </div>
                    <div className={styles.rangeContainer}>
                      <label>Epochs:</label>
                      <input
                        type="range"
                        id="epoch"
                        name="epoch"
                        min="1"
                        max="100"
                        step="1"
                        value={epoch}
                        onChange={handleEpochChange}
                        className={styles.rangeInput}
                      />
                      {epoch}
                      <label>Learning Rate: </label>
                      <input
                        type="range"
                        id="lr"
                        name="lr"
                        min="0.0001"
                        max="1"
                        step="0.0001"
                        value={lr}
                        onChange={handleLrChange}
                        className={styles.rangeInput}
                      />
                      {lr}
                      <label>Batch Size:</label>
                      <input
                        type="range"
                        id="batchSize"
                        name="batchSize"
                        min="16"
                        max="64"
                        step="16"
                        value={batchSize}
                        onChange={handleBatchSizeChange}
                        className={styles.rangeInput}
                      />
                      {batchSize}
                    </div>
                  </div>
                ) : embeddingMethodStored === "fasttext" ? (
                  <div className={styles.selectMethodContainer}>
                    <span className={styles.modelTitle}>Model: FastText</span>
                    <br />
                    {ResultModelTraining && (
                      <span
                        style={{
                          color: "red",
                          fontWeight: "bold",
                          fontSize: "16px",
                          backgroundColor: "#ffe6e6",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          border: "1px solid red",
                          display: "inline-block",
                        }}
                      >
                        {ResultModelTraining}
                      </span>
                    )}
                    <div className={styles.selectMethodTitle}>
                      Select Data Partitioning
                    </div>

                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="model-partition">Partition</InputLabel>
                      <Select
                        labelId="model-partition"
                        value={selectedPartition}
                        onChange={setPartition}
                        label="Choose a Model"
                      >
                        <MenuItem value="80-20">80% - 20%</MenuItem>
                        <MenuItem value="70-30">70% - 30%</MenuItem>
                      </Select>
                    </FormControl>
                    {/* 
                    <div className={styles.inlineContainer}>
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className={styles.iconPadding}
                      />
                      <Typography
                        variant="body2"
                        className={styles.descriptionText}
                      >
                        FastText, developed by Facebook AI, is an NLP library
                        for word vector representation and text classification.
                        It uses subword n-grams and includes a built-in linear
                        classifier with softmax for efficient text
                        classification.
                      </Typography>
                    </div> */}
                    <div className={styles.selectMethodTitle}>
                      Adjust Hyperparameters
                    </div>
                    <div className={styles.rangeContainer}>
                      <label htmlFor="epoch">Epoch:</label>
                      <input
                        type="range"
                        id="epoch"
                        name="epoch"
                        min="1"
                        max="100"
                        step="1"
                        value={epoch}
                        onChange={handleEpochChange}
                        className={styles.rangeInput}
                      />
                      <span>{epoch}</span>

                      <label htmlFor="lr">Learning Rate (lr):</label>
                      <input
                        type="range"
                        id="lr"
                        name="lr"
                        min="0.0001"
                        max="1"
                        step="0.0001"
                        value={lr}
                        onChange={handleLrChange}
                        className={styles.rangeInput}
                      />
                      <span>{lr}</span>

                      <label htmlFor="wordNgrams">Word N-Grams:</label>
                      <input
                        type="range"
                        id="wordNgrams"
                        name="wordNgrams"
                        min="1"
                        max="5"
                        step="1"
                        value={wordNgrams}
                        onChange={handleWordNgramsChange}
                        className={styles.rangeInput}
                      />
                      <span>{wordNgrams}</span>
                    </div>
                  </div>
                ) : null}
                {loading ? (
                  <div className={styles.loadingContainer}>
                    <FaSpinner className={styles.loadingIcon} />
                    <p>Please wait, processing your request...</p>
                  </div>
                ) : (
                  <div style={{ marginTop: "-8px" }}>
                    <button
                      title="Return to Step 1"
                      className={styles.proceedButtonStep2}
                      onClick={() => {
                        setCurrentStage(1);
                      }}
                    >
                      {" "}
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>

                    {selectedPartition && (
                      <button
                        title="Proceed to Step 3"
                        className={styles.proceedButtonStep2}
                        onClick={() => {
                          if (embeddingMethodStored === "fasttext") {
                            handleRunFastTextModelTraining(); // Run FastText Model Training
                          } else if (embeddingMethodStored === "tfidf") {
                            handleRunTFIDFModelTraining(); // Run TF-IDF Model Training
                          } else {
                            handleRunAraBERTModelTraining(); // Run AraBERT Model Training
                          }
                        }}
                      >
                        {" "}
                        <FontAwesomeIcon icon={faArrowRight} />
                      </button>
                    )}
                  </div>
                )}{" "}
              </>
            ) : currentStage === 3 ? (
              <>
                {embeddingMethodStored === "tfidf" ? (
                  <>
                    <div className={styles.modelTrainingContainer}>
                      <span className={styles.modelTitle}>
                        Model: Naive Bayes
                      </span>
                      <div className={styles.modelTitleTrainingResult}>
                        Modeling Results
                      </div>
                      {ModelTrainingResults &&
                      ModelTrainingResults.classificationReport ? (
                        <div>
                          {/* Classification Report Table */}
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th className={styles.tableHeader}>Label</th>
                                <th className={styles.tableHeader}>
                                  Precision
                                </th>
                                <th className={styles.tableHeader}>Recall</th>
                                <th className={styles.tableHeader}>F1-Score</th>
                                <th className={styles.tableHeader}>Support</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(
                                ModelTrainingResults.classificationReport
                              )
                                .filter(
                                  ([label]) =>
                                    label !== "macro avg" &&
                                    label !== "weighted avg" &&
                                    label !== "accuracy"
                                )
                                .map(([label, metrics]) => (
                                  <tr key={label}>
                                    <td className={styles.tableCell}>
                                      {label}
                                    </td>
                                    <td className={styles.tableCell}>
                                      {(metrics.precision * 100).toFixed(2)}%
                                    </td>
                                    <td className={styles.tableCell}>
                                      {(metrics.recall * 100).toFixed(2)}%
                                    </td>
                                    <td className={styles.tableCell}>
                                      {(metrics["f1-score"] * 100).toFixed(2)}%
                                    </td>
                                    <td className={styles.tableCell}>
                                      {metrics.support}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>

                          {/* Display accuracy in a separate row below the table */}
                          {ModelTrainingResults.accuracy && (
                            <div
                              className={styles.accuracyContainer}
                              style={{
                                color:
                                  ModelTrainingResults.accuracy >= 0.8
                                    ? "green"
                                    : ModelTrainingResults.accuracy >= 0.5
                                    ? "orange"
                                    : "red",
                              }}
                            >
                              <strong>Accuracy: </strong>
                              {(ModelTrainingResults.accuracy * 100).toFixed(2)}
                              %
                            </div>
                          )}
                        </div>
                      ) : (
                        <p>No classification report available.</p>
                      )}
                    </div>
                    <button
                      title="Return to Step 2"
                      className={styles.proceedButtonStep2}
                      onClick={() => {
                        setCurrentStage(2);
                      }}
                    >
                      {" "}
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                  </>
                ) : embeddingMethodStored === "fasttext" ? (
                  <>
                    <div className={styles.modelTrainingContainer}>
                      <span className={styles.modelTitle}>Model: FastText</span>
                      <div className={styles.modelTitleTrainingResult}>
                        Modeling Results
                      </div>
                      {ModelTrainingResults &&
                      ModelTrainingResults.classificationReport ? (
                        <div>
                          {/* Scrollable Table Container */}
                          <div className={styles.scrollableTable}>
                            <table className={styles.table}>
                              <thead>
                                <tr>
                                  <th className={styles.tableHeader}>Label</th>
                                  <th className={styles.tableHeader}>
                                    Precision
                                  </th>
                                  <th className={styles.tableHeader}>Recall</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(
                                  ModelTrainingResults.classificationReport
                                )
                                  .filter(
                                    ([label]) =>
                                      label !== "macro avg" &&
                                      label !== "weighted avg" &&
                                      label !== "accuracy"
                                  )
                                  .map(([label, metrics]) => (
                                    <tr key={label}>
                                      <td className={styles.tableCell}>
                                        {label.replace("__label__", "")}
                                      </td>
                                      <td className={styles.tableCell}>
                                        {(metrics.precision * 100).toFixed(2)}%
                                      </td>
                                      <td className={styles.tableCell}>
                                        {(metrics.recall * 100).toFixed(2)}%
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Display accuracy in a separate row below the table */}
                          {ModelTrainingResults.accuracy && (
                            <div
                              className={styles.accuracyContainer}
                              style={{
                                color:
                                  ModelTrainingResults.accuracy >= 0.8
                                    ? "green"
                                    : ModelTrainingResults.accuracy >= 0.5
                                    ? "orange"
                                    : "red",
                              }}
                            >
                              <strong>Accuracy: </strong>
                              {(ModelTrainingResults.accuracy * 100).toFixed(2)}
                              %
                            </div>
                          )}
                        </div>
                      ) : (
                        <p>No classification report available.</p>
                      )}
                    </div>

                    <button
                      title="Return to Step 2"
                      className={styles.proceedButtonStep2}
                      onClick={() => {
                        setCurrentStage(2);
                      }}
                    >
                      {" "}
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                  </>
                ) : embeddingMethodStored === "arabert" ? (
                  <>
                    <div className={styles.modelTrainingContainer}>
                      <span className={styles.modelTitle}>Model: AraBERT</span>
                      <div className={styles.modelTitleTrainingResult}>
                        Modeling Results
                      </div>
                      {ModelTrainingResults &&
                      ModelTrainingResults.classificationReport ? (
                        <div>
                          {/* Classification Report Table */}
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th className={styles.tableHeader}>Label</th>
                                <th className={styles.tableHeader}>
                                  Precision
                                </th>
                                <th className={styles.tableHeader}>Recall</th>
                                <th className={styles.tableHeader}>F1-Score</th>
                                <th className={styles.tableHeader}>Support</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(
                                ModelTrainingResults.classificationReport
                              )
                                .filter(
                                  ([label]) =>
                                    label !== "macro avg" &&
                                    label !== "weighted avg" &&
                                    label !== "accuracy"
                                )
                                .map(([label, metrics]) => (
                                  <tr key={label}>
                                    <td className={styles.tableCell}>
                                      {label}
                                    </td>
                                    <td className={styles.tableCell}>
                                      {(metrics.precision * 100).toFixed(2)}%
                                    </td>
                                    <td className={styles.tableCell}>
                                      {(metrics.recall * 100).toFixed(2)}%
                                    </td>
                                    <td className={styles.tableCell}>
                                      {(metrics["f1-score"] * 100).toFixed(2)}%
                                    </td>
                                    <td className={styles.tableCell}>
                                      {metrics.support}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>

                          {/* Display accuracy in a separate row below the table */}
                          {ModelTrainingResults.accuracy && (
                            <div
                              className={styles.accuracyContainer}
                              style={{
                                color:
                                  ModelTrainingResults.accuracy >= 0.8
                                    ? "green"
                                    : ModelTrainingResults.accuracy >= 0.5
                                    ? "orange"
                                    : "red",
                              }}
                            >
                              <strong>Accuracy: </strong>
                              {(ModelTrainingResults.accuracy * 100).toFixed(2)}
                              %
                            </div>
                          )}
                        </div>
                      ) : (
                        <p>No classification report available.</p>
                      )}
                    </div>
                    <button
                      title="Return to Step 2"
                      className={styles.proceedButtonStep2}
                      onClick={() => {
                        setCurrentStage(2);
                      }}
                    >
                      {" "}
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                  </>
                ) : null}
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
export default PipilineModeling;
