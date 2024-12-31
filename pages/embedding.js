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
  const [cleanedData, setCleanedData] = useState(null);

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

  // SentenceTransformer Method
  const [commentsNb, setCommentsNb] = useState(10);
  const [maxComments, setMaxComments] = useState(5000);
  const [transformerDim, setTransformerDim] = useState(64);
  const [embeddedData1, setEmbeddedData1] = useState(null);
  // const [FeaturesNames, setFeaturesNames] = useState(["0"]);

  // Function to update commentsNb and description
  const handleSliderChange = (e) => {
    const value = e.target.value;
    setCommentsNb(value);
  };

  // Step 3 - View Results
  const [nextPipeline, setNextPipeline] = useState(false);
  // TF-IDF Method
  // Custom toolbar component
  const CustomToolbar = () => (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <GridToolbar />
    </Box>
  );

  // First Logic For TF-IDF Table Preview
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

  // Second Logic For SentenceTransformer Table Preview

  const FeaturesNames = useMemo(() => {
    return Array.from({ length: transformerDim }, (_, i) => `Weight ${i + 1}`);
  }, [transformerDim]);

  const mapDataToRows1 = (rawData, embeddedData1) => {
    const rows = [];

    if (rawData && Array.isArray(rawData) && rawData.length > 0) {
      // Limit the number of comments based on commentsNb
      const limitedData = rawData.slice(0, commentsNb);

      limitedData.forEach((dataItem, index) => {
        const { Comment } = dataItem;
        const uniqueId = `comment-${index + 1}`;

        // Get the features for the current comment (embedded data)
        const features = embeddedData1[index]; // Ensure embeddedData1 is an array of arrays

        if (features && transformerDim && features.length === transformerDim) {
          const row = {
            id: uniqueId,
            Comment: Comment,
            ...FeaturesNames.reduce((acc, featureName, featureIndex) => {
              acc[featureName] = features[featureIndex]; // Populate feature values
              return acc;
            }, {}),
          };

          rows.push(row);
        } else {
          console.error(
            `Features for comment ${
              index + 1
            } do not match the expected transformerDim length.`
          );
        }
      });
    } else {
      console.error("rawData does not contain a valid array.");
    }
    return rows;
  };

  const rows1 = useMemo(() => {
    if (!tokenizedData || !embeddedData1) return [];
    return mapDataToRows1(tokenizedData, embeddedData1);
  }, [tokenizedData, embeddedData1]);

  const columns1 = useMemo(() => {
    if (!embeddedData1 || !FeaturesNames?.length) return [];

    const baseColumns = [
      { field: "Comment", headerName: "Comment", width: 300 },
    ];

    const weightColumns = Array.from(
      { length: transformerDim },
      (_, index) => ({
        field: `Weight ${index + 1}`,
        headerName: `Weight ${index + 1}`,
        width: 100,
      })
    );

    return [...baseColumns, ...weightColumns];
  }, [embeddedData1, FeaturesNames]);

  const VISIBLE_FIELDS1 = useMemo(() => {
    if (!embeddedData1 || !FeaturesNames?.length) return ["Comment"];

    // Add "Weight" columns to the visible fields
    const weightFields = Array.from(
      { length: transformerDim },
      (_, index) => `Weight ${index + 1}`
    );

    // Include "Comment" and the weight columns
    return ["Comment", ...weightFields];
  }, [embeddedData1, FeaturesNames]);

  const filteredColumns1 = useMemo(() => {
    const filtered = columns1.filter((col) =>
      VISIBLE_FIELDS1.includes(col.field)
    );

    return filtered;
  }, [columns1, VISIBLE_FIELDS1]);

  const modifiedColumns1 = useMemo(
    () =>
      filteredColumns1.map((col) =>
        col.field === "specificFieldName" // Replace "specificFieldName" with the field you want to target
          ? { ...col, filterable: false }
          : col
      ),
    [filteredColumns1]
  );

  // Handle Method Switching
  const handleMethodChange = (event) => {
    const method = event.target.value;
    setSelectedMethod(method);
    switch (method) {
      // case "camel":
      //   setDescription(
      //     <>
      //       CAMeL Tools: Specialized models for dialects like Egyptian,
      //       Levantine, and Gulf.
      //       <br />
      //       It works by training deep learning models on{" "}
      //       <strong>dialects</strong>, focusing on{" "}
      //       <strong>language patterns</strong> to improve{" "}
      //       <strong>language processing</strong> in specific Arabic regions.
      //     </>
      //   );
      //   break;
      case "sentencetransformer":
        setDescription(
          <>
            High-quality sentence embeddings for tasks like semantic search and
            text similarity analysis.
            <br />
            It uses <strong>deep learning models</strong> to turn sentences into{" "}
            <strong>dense vector embeddings</strong>, capturing their{" "}
            <strong>semantic meaning</strong> for tasks like{" "}
            <strong>clustering</strong>, <strong>search</strong>, and{" "}
            <strong>text similarity</strong>.
            <br />
            For more details, you can refer to the{" "}
            <a
              href="https://huggingface.co/omarelshehy/Arabic-STS-Matryoshka-V2"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation
            </a>
            .
          </>
        );
        break;
      case "fasttext":
        setDescription(
          <>
            FastText: Captures subword-level info, useful for slang and rare
            words.
            <br />
            It works by breaking words into <strong>subwords</strong> (n-grams),
            learning <strong>word representations</strong> to handle{" "}
            <strong>rare words</strong>, <strong>slang</strong>, and{" "}
            <strong>spelling variations</strong>.
            <br />
            For more details, you can refer to the{" "}
            <a
              href="https://huggingface.co/facebook/fasttext-ar-vectors"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation
            </a>
            .
          </>
        );

        break;
      case "tfidf":
        setDescription(
          <>
            A traditional method for term importance and document similarity.
            <br />
            It works by measuring <strong>term frequency (TF)</strong> in a
            document and <strong>inverse document frequency (IDF)</strong>{" "}
            across all documents to identify <strong>important terms</strong> in
            a corpus.
          </>
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
    const storedTokenizedData = sessionStorage.getItem("tokenizedData");
    if (storedTokenizedData) {
      setTokenizedData(JSON.parse(storedTokenizedData));
    }

    // Retrieve cleanedData from sessionStorage
    const storedCleanedData = sessionStorage.getItem("cleanedData");
    if (storedCleanedData) {
      setCleanedData(JSON.parse(storedCleanedData));
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

  // Dynamically set the max comments if cleanedData is available
  useEffect(() => {
    if (cleanedData) {
      const max = cleanedData.length || maxComments;
      setMaxComments(max);
    }
  }, [cleanedData]);

  // Run the Embedding Word TF-IDF Method
  const handleRunTFIDFEmbeddingMethod = async (e) => {
    // Get values from form elements
    const method = "tfidf";
    const maxFeatures = parseInt(
      document.getElementById("maxFeatures").value,
      10
    );
    const minDf = parseFloat(document.getElementById("minDf").value);
    const maxDf = parseFloat(document.getElementById("maxDf").value);

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

      if (data.features) {
        setEmbeddedData(data);
        setEmbeddedData1(null);
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

  // Run the Embedding Word SentenceTransformer Method
  const handleRunTransformerEmbeddingMethod = async () => {
    const comments = cleanedData
      .slice(0, commentsNb)
      .map((item) => item.Comment);

    // Validate if comments exist
    if (!comments || comments.length === 0) {
      setResultFeatureExtraction("Comments are required.");
      return;
    }

    const batchSize = 100; // Number of comments per batch to optimize the API calls
    const formattedNgrokUrl = ngrokUrl.endsWith("/")
      ? ngrokUrl
      : `${ngrokUrl}/`; // Ensure the URL has a trailing slash

    const dim = transformerDim;
    setLoading(true);
    const collectedEmbeddings = [];

    try {
      // Iterate through comments in batches
      for (let i = 0; i < comments.length; i += batchSize) {
        const batch = comments.slice(i, i + batchSize); // Get the current batch of comments

        try {
          // Send the batch of comments and dim value to the Flask backend
          const response = await fetch(
            `${formattedNgrokUrl}embedding-transformer`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ comments: batch, dim: dim }), // Include dim in the request
            }
          );

          // Handle response from backend
          if (response.ok) {
            const data = await response.json();

            if (data.embeddings) {
              collectedEmbeddings.push(...data.embeddings); // Collect the embeddings
            } else {
              setResultFeatureExtraction(
                `No embeddings returned for batch:", ${batch}`
              );
            }
          } else {
            setResultFeatureExtraction(
              `Failed to fetch embeddings for batch starting at index ${i}`
            );
          }
        } catch (batchError) {
          setResultFeatureExtraction(
            `Error processing batch:",  ${batchError}`
          );
        }
      }
      // After collecting all embeddings, update the state or handle them as needed
      setEmbeddedData1(collectedEmbeddings);
      setEmbeddedData(null);
      setCurrentStage(3); // Move to the next stage or update UI accordingly
    } catch (error) {
      setResultFeatureExtraction(`Error: ${error.message}`);
    } finally {
      setLoading(false); // Hide loading indicator after processing
    }
  };

  // Run the Embedding Word FastText Method
  const handleRunFastTextEmbeddingMethod = async () => {
    // const comments = cleanedData.slice(0, 500).map((item) => item.Comment);
    const comments = cleanedData.map((item) => item.Comment);

    // Validate if comments exist
    if (!comments || comments.length === 0) {
      setResultFeatureExtraction("Comments are required.");
      return;
    }

    const batchSize = 1000; // Number of comments per batch to optimize the API calls
    const formattedNgrokUrl = ngrokUrl.endsWith("/")
      ? ngrokUrl
      : `${ngrokUrl}/`; // Ensure the URL has a trailing slash

    setLoading(true);
    const collectedEmbeddings = [];

    try {
      // Iterate through comments in batches
      for (let i = 0; i < comments.length; i += batchSize) {
        const batch = comments.slice(i, i + batchSize); // Get the current batch of comments

        try {
          // Send the batch of comments to the Flask backend
          const response = await fetch(
            `${formattedNgrokUrl}embedding-fasttext`, // Updated to the FastText endpoint
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ comments: batch, batch_size: batchSize }), // Pass batch size if necessary
            }
          );

          // Handle response from backend
          if (response.ok) {
            const data = await response.json();
            console.log("data", data);

            if (data.embeddings) {
              collectedEmbeddings.push(...data.embeddings); // Collect the embeddings
            } else {
              setResultFeatureExtraction(
                `No embeddings returned for batch: ${batch}`
              );
            }
          } else {
            setResultFeatureExtraction(
              `Failed to fetch embeddings for batch starting at index ${i}`
            );
          }
        } catch (batchError) {
          setResultFeatureExtraction(`Error processing batch: ${batchError}`);
        }
      }

      // After all batches are processed, update the result
      setResultFeatureExtraction(collectedEmbeddings);
    } catch (error) {
      setResultFeatureExtraction(`An error occurred: ${error}`);
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
                      {/* <MenuItem value="camel">CAMeL Tools</MenuItem> */}
                      <MenuItem value="tfidf">TF-IDF</MenuItem>
                      <MenuItem value="sentencetransformer">
                        SentenceTransformer
                      </MenuItem>
                      <MenuItem value="fasttext">FastText</MenuItem>
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
                {selectedMethod === "tfidf" && (
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
                )}

                {selectedMethod === "sentencetransformer" && (
                  <div className={styles.transformerConfigContainer}>
                    <h3 style={{ marginTop: "8px" }}>
                      Configure SentenceTransformer Parameters
                    </h3>
                    <p className={styles.transformermethodDescription}>
                      Adjust the parameters below to customize how the Sentence
                      Transformer method processes your comments:
                    </p>
                    {resultFeatureExtraction && (
                      <div className={styles.transformermethodError}>
                        ❌ {resultFeatureExtraction}
                      </div>
                    )}
                    <div className={styles.transformerparamGroup}>
                      <label
                        htmlFor="commentsNb"
                        className={styles["transformerconfig-label"]}
                      >
                        Comments Number:
                      </label>
                      <input
                        type="range"
                        id="commentsNbSlider"
                        name="commentsNb"
                        min="5"
                        max={maxComments}
                        step="1"
                        defaultValue="10"
                        onChange={handleSliderChange}
                      />
                      <span
                        id="commentsNb"
                        className={styles.transformersliderValue}
                      >
                        {commentsNb}
                      </span>

                      <span className={styles.transformerparamDesc}>
                        Number of comments used for analysis. (e.g., 10).
                      </span>
                    </div>

                    <div>
                      <label
                        className={styles["transformerconfig-label"]}
                        htmlFor="transformerDim"
                      >
                        SentenceTransformer Dimension:
                      </label>
                      <br />
                      <span className={styles["transformerconfig-description"]}>
                        Controls the size of the embedding vector. Smaller
                        dimensions (e.g., 64) use less memory but may lose
                        detail, while larger dimensions (e.g., 768) capture more
                        information but require more resources.
                      </span>
                    </div>
                    <select
                      className={styles["transformerconfig-input"]}
                      id="transformerDim"
                      value={transformerDim}
                      onChange={(e) =>
                        setTransformerDim(Number(e.target.value))
                      }
                    >
                      <option value="64">64</option>
                      <option value="128">128</option>
                      <option value="256">256</option>
                      <option value="512">512</option>
                      <option value="768">768</option>
                    </select>
                  </div>
                )}
                {selectedMethod === "fasttext" && (
                  <button
                    title="Proceed to Step 3"
                    className={styles.proceedButton}
                    onClick={() => {
                      handleRunFastTextEmbeddingMethod();
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                )}

                {/* Button Container By Method */}
                {loading && selectedMethod === "tfidf" ? (
                  <div className={styles.loadingContainer}>
                    <FaSpinner className={styles.loadingIcon} />
                    <p>Please wait, processing your request...</p>
                  </div>
                ) : loading && selectedMethod === "sentencetransformer" ? (
                  <div className={styles.loadingContainer}>
                    <FaSpinner className={styles.loadingIcon} />
                    <p>Please wait, processing your request...</p>
                  </div>
                ) : loading && selectedMethod === "fasttext" ? (
                  <div className={styles.loadingContainer}>
                    <FaSpinner className={styles.loadingIcon} />
                    <p>Please wait, processing your request...</p>
                  </div>
                ) : null}

                {!loading && selectedMethod === "tfidf" ? (
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
                        handleRunTFIDFEmbeddingMethod();
                        // handleRunEmbeddingAraBert();
                      }}
                    >
                      {" "}
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                ) : !loading && selectedMethod === "sentencetransformer" ? (
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
                        handleRunTransformerEmbeddingMethod();
                      }}
                    >
                      {" "}
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                ) : null}
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

                {embeddedData1 && (
                  <>
                    <div className={styles.tablePreview}>
                      {/* <div className={styles.tableContainer}> */}
                      <div style={{ height: 280, width: "100%" }}>
                        <DataGrid
                          rows={rows1}
                          columns={modifiedColumns1}
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
