# ScrapeSense

ScrapeSense is an NLP platform for scraping YouTube comments from **any video** and **analyzing the sentiment of Arabic comments**.

It makes scraping, cleaning, embedding, and modeling easy and fast.

This guide walks you through the setup, deployment, and interaction with the ScrapeSense application.

![Logo](https://i.ibb.co/MPYVF6K/Logo.png)

## 🧰 Tech Stack

### **Frontend:**

- Next.Js

### **Backend:**

- Flask

### **Development Environment:**

- Google Colab

### **Tunneling:**

- Ngrok

### **APIs:**

- YouTube Data API v3

### **Deployment:**

- Vercel

### **NLP Libraries**

- **TF-IDF:** Traditional embedding method based on word frequency.
- **FastText:** Non-contextual embedding method from Meta for word representation.
- **AraBERT:** Contextual embedding method for Arabic comments, capturing dialects and meaning.

### **Models Training**

- **Naive Bayes:** For sentiment classification using basic probabilistic modeling.
- **FastText:** For training sentiment analysis models based on non-contextual word embeddings.
- **AraBERT:** For fine-tuning sentiment analysis models using contextual embeddings of Arabic comments.

## 📑 Prerequisites

- [ScrapeSense-FlaskApp: GoogleColab Notebook](https://colab.research.google.com/drive/1c4ApFYbPUpPUqhun7NhbTNMvfYLjEWk2)
- [Ngrok Account](https://dashboard.ngrok.com/)
- [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com?project=winged-helper-436714-h7&invt=Abk0Aw)

## 🔥 Features

- **YouTube Comments Scraping:**
  Scrape comments from any YouTube video. The data can be exported as a CSV file for easy analysis.
- **Data Cleaning:**
  Clean the scraped data by removing duplicates, handling missing values, and standardizing formats to prepare it for further processing.

- **Word Embedding:**
  Convert words into vector representations using techniques like **TF-IDF**, **FastText**, and **AraBERT** for better text analysis and sentiment understanding.

- **Data Modeling (Sentiment Analysis):**  
  Perform sentiment analysis on Arabic comments using machine learning models to classify sentiments as positive, negative, or neutral.

## 🚀 Getting Started

### 1. Create an Ngrok account

📌 **Ngrok** is used in the ScrapeSense app to create a tunnel, allowing the Flask app running in Google Colab to connect to the ScrapeSense user interface.

- Visit the [Ngrok website](https://dashboard.ngrok.com/) and create an account.
- After signing up, go to your dashboard and find your Authtoken under the "Auth" section. You can find it [here](https://dashboard.ngrok.com/get-started/your-authtoken).
- Copy the **Authtoken**, as you'll need it to connect Ngrok to your local server (in Google Colab).

![Ngrok Authtoken](https://github.com/user-attachments/assets/c986d981-e3d3-45e5-9e42-1482cdc0d251)

### 2. Activate YouTube Data API v3

📌 **YouTube Data API v3** is used in the ScrapeSense app to access and scrape comments from YouTube videos.

#### 2.1 Create a Project (If You Don’t Have One):

- Go to the [Google Cloud Console](https://console.cloud.google.com/), and create a new project if you don’t have one already.

#### 2.2 Enable the API:

- Navigate to **API & Services > Library**, search for **YouTube Data API v3**, or use this [direct link](https://console.cloud.google.com/apis/library/youtube.googleapis.com?project=winged-helper-436714-h7&invt=AbmDTw) to enable it for your project.

#### 2.3 Generate an API Key:

- Go to **Credentials**, click **Create Credentials**, select **API Key**, and copy it for the ScrapeSense setup.

![API Key](https://github.com/user-attachments/assets/1c807eac-c142-40c5-b564-09b807d3d37d)

⚠️ Keep your API Key secure. Do not share it publicly.

### 3. Setup ScrapeSense-FlaskApp

#### 3.1 Open the ScrapeSense-FlaskApp:

- Open the **ScrapeSense-FlaskApp** in Google Colab by following this [link](https://colab.research.google.com/drive/1c4ApFYbPUpPUqhun7NhbTNMvfYLjEWk2#scrollTo=ZKJhGxL3Y7lA).

#### 3.2 Configure Your ScrapeSense-FlaskAp:

- After creating your Ngrok account, copy your **Authtoken**.
- In the **ScrapeSense-FlaskApp** notebook, paste your **Authtoken** in the code section provided in the first step. This will configure Ngrok to connect your local server to the public internet.

![Ngrok Config in ScrapeSense-FlaskApp](https://github.com/user-attachments/assets/be0e3e82-7386-46ba-98a0-4a8b2b1adabf)

#### 3.3 Run the ScrapeSense-FlaskApp:

- First, run the initial part of the code. This may take a few minutes to set up the Flask app and install the required libraries and models.
- Then, run the second part of the code. This step is usually faster and sets up all the app routes.
- Once the second part runs, you will see the **Ngrok URL** as the output. This URL will look something like `https://xyz.ngrok-free.app`. Use this URL to interact with the ScrapeSense app.

![Ngrok URL](https://github.com/user-attachments/assets/2f16cf8a-363c-477b-8bdb-1d015776a016)

- Alternatively, you can access the generated **Ngrok URL** directly from your [Ngrok Agents](https://dashboard.ngrok.com/agents)., click on the running agent, and copy the URL provided.

### 4. Setup ScrapeSense GUI

#### 4.1 Open the ScrapeSense GUI:

- Open the [**ScrapeSense GUI**](https://scrape-sense.vercel.app/).

#### 4.2 Enter the following details:

- **Ngrok URL**:
  - Paste the **Ngrok URL** that was generated in the previous steps from the **ScrapeSense-FlaskApp**. This URL will connect your local Flask server to the ScrapeSense GUI.

![ScrapeSense Ngrok Setup](https://github.com/user-attachments/assets/93f869b2-cbc6-4ad1-8147-7870dda6ec2e)

- **YouTube API Key**:
  - Paste the **YouTube API Key** that you obtained from the Google Cloud Console. This API key will allow the ScrapeSense app to access YouTube comments and scrape data.

![ScrapeSense API Key Setup](https://github.com/user-attachments/assets/f9a94289-eef2-4347-a2a7-981dcc0ff5e5)

### 5. Run the App

Click **"Start"** to begin the scraping and processing workflow. The app will go through 4 pipelines:

#### 5.1 Scrape YouTube Comments:

- The app will scrape comments from **any YouTube video** using the YouTube API.

#### 5.2 Clean the Data:

- The app will clean the Arabic comments by removing duplicates and fixing any missing or incorrect values.

#### 5.3 Embed Words:

- The app will apply NLP techniques to process and embed the words in the dataset for analysis.

#### 5.4 Prepare the Data:

- The app will split the data into training and testing sets and apply basic machine learning models for analysis.

## 🔧 Troubleshooting

If you run into any issues, try the following steps:

- **Flask App Status**: If the Flask app is down, it’s likely due to the Ngrok agent being down. Check the [Ngrok Agents](https://dashboard.ngrok.com/agents) for its status. If it’s down, restart the [**ScrapeSense-FlaskApp**](https://colab.research.google.com/drive/1c4ApFYbPUpPUqhun7NhbTNMvfYLjEWk2) (Step 3 in the setup process).  
  **Note**: If you receive an error saying that the Colab notebook has crashed, try refreshing the page and rerunning the notebook. It will solve the problem.

- **API Key Errors**: Double-check that your API key is **correct** and that the [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com?project=winged-helper-436714-h7&invt=Abk0Aw) is **enabled** on Google Cloud.

- **Dataset Issues**: If the dataset isn't loading or cleaning properly, ensure that the file is in **CSV format** and that it contains only the two required columns: **Comment** and **Label**.

## 📝 Authors

- GitHub: [@bensaied](https://www.github.com/bensaied)

## Contributing

Contributions are always welcome! Feel free to fork this repository and submit pull requests.

- [Ghassen Ben Ali](https://github.com/ghassenbenali96)
- [Ikram Loued](https://github.com/Ikramloued)

## 💝 Support

For support, don't forget to leave a star ⭐️.

## ⚖️ License

This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.

## 🔗 Links

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/bensaied/)
