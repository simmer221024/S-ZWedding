// Your client ID from the Google Cloud Console
const CLIENT_ID = '295905583318-voe2d1asjii4f5mb7uogn4dtc1cq9n90.apps.googleusercontent.com';
const API_KEY = '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';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('uploadForm').style.display = 'none';

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.visibility = 'visible';
    }
}

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        document.getElementById('authorize_button').style.display = 'none';
        document.getElementById('uploadForm').style.display = 'block';
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}

document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const files = document.getElementById('photoInput').files;
    for (let file of files) {
        uploadPhoto(file);
    }
});

async function uploadPhoto(file) {
    const metadata = {
        name: file.name,
        mimeType: file.type,
    };

    try {
        const accessToken = gapi.auth.getToken().access_token;
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        form.append('file', file);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({'Authorization': 'Bearer ' + accessToken}),
            body: form,
        });

        const result = await response.json();
        console.log('File uploaded, ID:', result.id);
        displayPhoto(result.id);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

function displayPhoto(fileId) {
    const img = document.createElement('img');
    img.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
    img.alt = 'Event photo';
    img.className = 'img-fluid';

    const col = document.createElement('div');
    col.className = 'col';
    
    const card = document.createElement('div');
    card.className = 'card shadow-sm';
    
    card.appendChild(img);
    col.appendChild(card);
    
    document.getElementById('gallery').appendChild(col);
}

// Add these functions to your HTML
window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;
window.handleAuthClick = handleAuthClick;
