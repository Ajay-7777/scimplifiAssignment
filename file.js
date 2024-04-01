const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
app.use(bodyParser.json());
const multer = require('multer');
const sessions = {};
const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT || 3000;


// Endpoint to create a new session
app.post('/api/v1/create-session', (req, res) => {
    const sessionId = generateSessionId();
    sessions[sessionId] = {
        files: [],
        result: 0
    };
    // console.log(sessions);
    res.json({ Session_id: sessionId });
});



// Endpoint to upload file to a session
app.post('/api/v1/upload-file/:session_id', upload.array('file', 15), (req, res) => {
    const sessionId = req.params.session_id;
    if (!sessions[sessionId]) {
        return res.status(404).json({ error: 'Session not found' });
    }

    const files = sessions[sessionId].files;
    if (files.length >= 15) {
        // Drop the first file if limit is reached
        files.shift();
    }

    const equations = req.files;
    // console.log(equations)
    for(const equation of equations){
    files.push(equation);}

    // Update the result
    sessions[sessionId].result = calculateResult(files);

    res.json({ Result: sessions[sessionId].result });
});


// Endpoint to delete the session
app.delete('/api/v1/delete-session/:session_id', (req, res) => {
    const sessionId = req.params.session_id;
    if (!sessions[sessionId]) {
        return res.status(404).json({ error: 'Session not found' });
    }

    delete sessions[sessionId];
    res.json({ message: 'Session deleted successfully' });
});

// Endpoint to delete a file from session
app.delete('/api/v1/delete-file/:session_id/:file_index', (req, res) => {
    const sessionId = req.params.session_id;
    const fileIndex = parseInt(req.params.file_index);
    if (!sessions[sessionId] || !sessions[sessionId].files[fileIndex]) {
        return res.status(404).json({ error: 'File not found' });
    }

    // Remove file from session
    sessions[sessionId].files.splice(fileIndex, 1);
    sessions[sessionId].result = calculateResult(sessions[sessionId].files);

    res.json({ Result: sessions[sessionId].result });
});

//  Function to calculate the result
function calculateResult(files) {
    let sum = 0;
    for (const equations of files) {
        const filePath = equations.path;
        const fileData = fs.readFileSync(filePath, 'utf8');
    // console.log(eval(fileData))
            sum += eval(fileData); 
        
    }
    return sum;
}

// Function to generate a random session id
function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


app.listen(PORT, () => {
    console.log(`Server is running on  port ${PORT}`);
});
 