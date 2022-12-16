import "../App.css";

import React, { useState, useRef } from "react";

import { BeatLoader } from "react-spinners";

const AudioImage = () => {


  const formRef = useRef(null);

  const textareaRef = useRef(null);

  const [inputItems, setInputItems] = useState([]);

  //state to handle if the loading spinner should activate
  const [isLoading, setIsLoading] = useState(false);

  const handleFileInputChange = (e) => {
    //keeps the current items  and adds on to it
    setInputItems([...inputItems, ...e.target.files]);

    console.log(inputItems);
  };

  //handles the form submit
  const handleFormSubmit = async (e) => {
    //prevents new window being opened
    e.preventDefault();

    setIsLoading(true);

    const formData = new FormData(formRef.current);

    try {
      const res = await fetch("http://localhost:5000/submit", {
        method: "POST",
        body: formData,
      });

      //get the file as a Blob object
      const fileBlob = await res.blob();

      //create a URL that can be used to download the file
      const fileUrl = URL.createObjectURL(fileBlob);

      //create a link element and simulate a click on it
      const a = document.createElement("a");

      a.href = fileUrl;

      a.download = `${textareaRef.current.value}.mp4`;

      a.click();
    } catch (err) {
      console.log(err);
    } finally {
      setInputItems([]);

      setIsLoading(false);

      formRef.current.reset();
    }
  };

  return (
    <div className="input-files">
      <form
        ref={formRef}
        className="form-for-files"
        enctype="multipart/form-data"
        onSubmit={handleFormSubmit}
      >
        <label for="file-input-audio">
          AUDIO
          <input
            type="file"
            id="file-input-audio"
            accept="audio/mp3, audio/wav"
            name="audio"
            onChange={handleFileInputChange}
          ></input>
        </label>
        <label for="file-input-image">
          IMAGE
          <input
            type="file"
            id="file-input-image"
            accept="image/png, image/jpeg"
            name="image"
            onChange={handleFileInputChange}
          ></input>
        </label>

        <label id="fileName" for="text-input">
          FILE NAME
          <textarea
            ref={textareaRef}
            id="text-input"
            name="text"
            maxlength="10"
          ></textarea>
        </label>

        <input
          type="submit"
          id="send-files"
          value="Upload"
          disabled={inputItems.length < 2}
        ></input>
        {isLoading && (
            <BeatLoader 
            style={{
              margin: "0 auto",
              display: "block",
              transform: "translatex(225px)"
            }}/>
        )}
      </form>
      <div className="files-display">
        {/* shows the file uploaded */}
        <p>Uploaded Files:</p>
        {inputItems.map((file) => (
          <p>{file.name}</p>
        ))}
      </div>
    </div>
  );
};

export default AudioImage;
