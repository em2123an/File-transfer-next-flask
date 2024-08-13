# Transfer Your Files in local network with Next.js and Flask (python)

## What it is
  This is a lightweight app made with Next.js for handling the front-end and Flask as web API. Basically, when you run the app, it creates a 'Shared Folder' in your 'Documents' folder as primary host (which is the node that runs main.py and npm command). Any files and folders inside this 'Shared Folder' will be accessible to download by anyone who has connected to your local network. In addition, you could easily upload your files to 'Shared Folder' located in primary host (which is the node that runs main.py and npm command).


## How to Run in development mode
  ### First, run in development
  #### 
      npm run dev -H 0.0.0.0 -p 3000
  ### Second, run 'main.py' to run the flask (for the API)
  ### Third, Open [http://localhost:3000](http://localhost:3000) with your browser
