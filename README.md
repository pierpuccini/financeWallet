# Finance wallet
The test feature both Backend and Frontend in the same repo. In order to access each one of them please navigate to each one on a separate command line or terminal.

**Backend**
1. Locate directory with: `cd backend`
2. Install dependencies: `npm install`
3. Run project with: `npm run-script dev`
* _If you wish to test please run:_ `npm run-script test`
4. Add to the root folder a `credentials.json` file with the following structure: 
    ``` 
    { 
        "BANK_ABREVIATION": {
            "id": "YOUR_ACC_ID",
            "password": YOUR_ACC_PASSWORD,
            "url": "YOUR_BANK_URL"
        }
    }
    ```
    *keep in mind that this file doesn't save due to git ignore.
5. Add a structured file structure under the TEMP folder as follows: 
    ```
    ├── temp
    └── BANK_ABREVIATION
        ├── YOUR_DESIRED STRUCTURE
    ```
    *Note: Please add to all generated files the id for the account
6. In order to view chromium in real time please add ```{ headless: false}``` to your puppeteer launch
    
**Frontend** 
1. Locate directory with: `cd frontend`
2. Install dependencies: `npm install`
3. Run project with: `npm start`
* _If you wish to test please run:_ `npm test`
