# ScrapeSense

Welcome to ScrapeSense ! an NLP platform designed for scraping YouTube video by subject of interest, preprocessing the data, embedding words, and modeling the dataset.

This guide walks you through the setup, deployment, and interaction with the ScrapeSense application.

![Logo](https://i.ibb.co/MPYVF6K/Logo.png)

## 🧰 Tech Stack

**Client:** Next.Js

**Server:** Flask

**Tunnel:** Ngrok

**APIs:** YouTube Data API v3

## 📑 Prerequisites

- [GoogleColab](https://colab.research.google.com/drive/1c4ApFYbPUpPUqhun7NhbTNMvfYLjEWk2)
- [Ngrok Account](https://dashboard.ngrok.com/)
- [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com?project=winged-helper-436714-h7&invt=Abk0Aw)

## 🔥 Features

- **YouTube Comments Scraping**: Scrape comments from YouTube videos using the YouTube Data API v3.
- **Data Cleaning**: Clean the dataset by removing duplicates, handling missing values, and standardizing formats.
- **Word Embedding**: Apply NLP techniques to embed words and prepare the data for further analysis.
- **Data Modeling**: Split the dataset into training and testing sets or other relevant partitions.

## 🚀 Getting Started

### 1. Create an Ngrok account

📌 Ngrok is used in ScrapeSense app to securely expose your local Flask server to the internet.

After creating an account, in the dashboard, find your Authtoken under "Auth" and copy it. This token is required to connect Ngrok to your local server.

### 2. Activate YouTube Data API v3

📌 YouTube Data API v3 is used in ScrapeSense app to access and scrape comments from YouTube videos.

2.1 Create Project:

Go to Google Cloud Console, create a project if you don’t have one.

2.2 Enable API:

Navigate to API & Services > Library, search for YouTube Data API v3, and click Enable.

2.3 Generate API Key:

Go to Credentials, click Create Credentials, select API Key, and copy it for the ScrapeSense setup.

⚠️ Keep your API Key secure. Do not share it publicly.

### 3. Setup ScrapeSense GUI

3.1 Open the ScrapeSense GUI.

3.2 Enter the following details:

- Ngrok URL: Paste the Ngrok URL obtained from Flask.

- YouTube API Key: Paste the API key from Google Cloud.

### 4. Run the App

Click "Start" to begin the scraping and processing workflow. The app will go through the following 4 pipelines:

4.1 YouTube Comments Data Scraping: Scrape comments from YouTube videos using the YouTube API.

4.2 Data Cleaning: Clean the scraped data by removing duplicates, handling missing values, and formatting it.

4.3 Embedding Words: Apply NLP techniques to embed words in the dataset.

4.4 Data Modeling: Prepare the dataset for advanced analytics or machine learning by partitioning it into training and testing sets and applying basic modeling techniques.

## 🔧 Troubleshooting

If you encounter issues, follow these steps:

- FlaskApp Status: ScrapeSense GUI provides real-time status of the Flask app. Ensure that the Flask server is running and the Ngrok URL is correctly linked to the app.

- Ngrok Connection Issues: If the Ngrok tunnel isn't working, try restarting the Flask server and Ngrok or regenerate a new Ngrok authtoken.

- API Key Errors: Ensure that your YouTube Data API v3 key is correct and the API is enabled on Google Cloud.

- Dataset Issues: If the dataset fails to load or clean, check for proper format, and ensure that all required columns are present.

## 📝 Authors

- Github: [@bensaied](https://www.github.com/bensaied)

## Contributing

Contributions are always welcome!

- [Ghassen Ben Ali ](https://github.com/ghassenbenali96)
- Ikram Loued

## 💝 Support

For support, don't forget to leave a star ⭐️.

## ⚖️ License

This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.

## 🔗 Links

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/bensaied/)
