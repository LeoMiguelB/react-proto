const express = require('express');

const multer = require('multer');

const path = require("path");

const app = express();

const port = 5000;

const ffmpeg = require('fluent-ffmpeg');

const fs = require('fs');

//name files for when stored in server
const { uniqueNamesGenerator } = require('unique-names-generator');

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
        dictionaries: [colors], 
        length: 1
    });
    
    command
    //pass the res to send res to website after done processing
    //check out fluent-ffmpeg node for more customization
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

    var absPath = path.join(__dirname, `/proc-files/${name}.mp4`);

    //headers for the front h
    res.setHeader('Content-Type', 'video/mp4');

    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"; type=video/mp4');

    res.sendFile(absPath);

    console.log('Finished processing');
}