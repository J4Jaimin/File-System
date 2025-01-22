import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function DirectoryView() {
  const BASE_URL = "http://localhost:4000";
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const [dirName, setDirName] = useState("");
  const { '*': dirPath } = useParams();

  async function getDirectoryItems() {
    const response = await fetch(`${BASE_URL}/directory/${dirPath}`);
    const data = await response.json();
    setDirectoryItems(data);
  }
  useEffect(() => {
    console.log(dirPath);
    getDirectoryItems();
  }, [dirPath]);

  async function uploadFile(e) {
    const file = e.target.files[0];
    // const formData = new FormData();
    // formData.append("file", file);
    // formData.append("filename", file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/files/${dirPath}/${file.name}`, true);
    xhr.addEventListener("load", () => {
      console.log(xhr.response);
      getDirectoryItems();
    });
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(totalProgress.toFixed(2));
    });

    xhr.send(file);
  }

  async function makeDirectory() {
    console.log(dirName);
    console.log(dirPath);
    const response = await fetch(`${BASE_URL}/directory/${dirPath}/${dirName}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ dirName }),
    });
    const data = await response.text();
    console.log(data);
    getDirectoryItems();
  }

  async function handleDelete(filename) {
    const response = await fetch(`${BASE_URL}/files/${dirPath}/${filename}`, {
      method: "DELETE"
    });
    const data = await response.text();
    console.log(data);
    getDirectoryItems();
  }

  async function renameFile(oldFilename) {
    console.log({ oldFilename, newFilename });
    setNewFilename(oldFilename);
  }

  async function saveFilename(oldFilename) {
    setNewFilename(oldFilename);
    const response = await fetch(`${BASE_URL}/files/${dirPath}/${oldFilename}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ newFilename: `${dirPath}/${newFilename}` }),
    });
    const data = await response.text();
    console.log(data);
    setNewFilename("");
    getDirectoryItems();
  }

  return (
    <>
      <h1>My Files</h1>
      <input type="file" onChange={uploadFile} />
      <input
        type="text"
        onChange={(e) => setNewFilename(e.target.value)}
        value={newFilename}
      />
      <input type="text"
        onChange={(e) => setDirName(e.target.value)}
        value={dirName}
      />
      <button onClick={makeDirectory}>Make Directory</button>

      <p>Progress: {progress}%</p>
      {directoryItems.map(({ fileName, isDirectory }, i) => (
        <div key={i}>
          {fileName} {isDirectory && <Link to={`./${fileName}`}>Open</Link>}
          {!isDirectory && <a href={`${BASE_URL}/files/${dirPath}/${fileName}?action=open`}>Open</a>}
          {!isDirectory && <a href={`${BASE_URL}/files/${dirPath}/${fileName}?action=download`}>Download</a>}
          <button onClick={() => renameFile(fileName)}>Rename</button>
          <button onClick={() => saveFilename(fileName)}>Save</button>
          <button
            onClick={() => {
              handleDelete(fileName);
            }}
          >
            Delete
          </button>
          <br />
        </div>
      ))}
    </>
  );
}

export default DirectoryView;
