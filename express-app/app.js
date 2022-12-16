const express = require('express');

const multer = require('multer');

const path = require("path");

const app = express();

const port = 5000;

const ffmpeg = require('fluent-ffmpeg');

const fs = require('fs');

const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

//time mark for progress check
const timeMark = null;

//specifies where the files will be stored
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + '/files');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
})

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));


app.post('/submit', upload.fields([
    {name: 'audio', maxCount: 1},
    {name: 'image', maxCount: 1}
]), async (req, res) => {

    //set new instance of ffmpeg
    const command = ffmpeg();
    
    res.setHeader("Access-Control-Allow-Origin", "*");

    var audioPath = './files/' + req.files.audio[0].filename;

    var imagePath = './files/' + req.files.image[0].filename;

    //files to delete 
    var files = [path.join(__dirname, audioPath), path.join(__dirname, imagePath)];

    //generate short name
    const shortName = uniqueNamesGenerator({
        dictionaries: [colors], // colors can be omitted here as not used
        length: 1
    });
    
    command
    //pass the res to send res to website after done processing
    .on('end', () => onEnd(files,res,shortName))
    .on('progress', onProgress)
    .on('error', onError)
    .input(audioPath)
    .input(imagePath)
    .size('1920x1080')
    .audioCodec('aac')
    .audioFrequency('48000')
    .audioBitrate('320k')
    .videoCodec('libx264')
    .outputFps(25)
    .output(`./proc-files/${shortName}.mp4`)
    .run();

})

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is listening to port ${port}`);
})


//functions for processing the video
const onProgress = (progress) => {

    console.log('Time mark: ' + progress.percent + '%');
}

const onError = (err, stdout, stderr) => {
    console.log('cannot process the video ' + err.message);
}

const onEnd = (files, res, name) => {
    files.forEach((file) => {
        fs.unlink(file, (err) => {
            if(err) throw err;
            console.log(`${file} was deleted`)
        });
    });

    //joins path to root to make absolute path
    var absPath = path.join(__dirname, `/proc-files/${name}.mp4`);

    res.setHeader('Content-Type', 'video/mp4');

    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"; type=video/mp4');

    res.sendFile(absPath);

    console.log('Finished processing');
}