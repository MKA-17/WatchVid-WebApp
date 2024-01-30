import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../store/auth";
import { app } from "../../utils/firebase";

function UploadModal({ show, setShow }) {
  const { auth } = useAuth();
  const [videoData, setVideoData] = useState({
    title: "",
    desc: "",
    tags: [],
    videoURL: "",
    imgURL: "",
  });
  const [uploadFiles, setUploadFiles] = useState({
    video: "",
    image: "",
  });
  const [uploadPercent, setUploadPercent] = useState({
    video: 0,
    image: 0,
  });

  const videoUploadMutation = useMutation({
    mutationFn: async (variables) => {
      return (
        await fetch(`${import.meta.env.VITE_API_URL}/video`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: auth.token, // Setting the Content-Type header to JSON
          },
          body: JSON.stringify(variables),
        })
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside VideoUpload mutation: ", data, variables);
      if (data.success) {
        setVideoData(() => ({
          title: "",
          desc: "",
          tags: [],
          videoURL: "",
          imgURL: "",
        }));
        setUploadFiles(() => ({
          video: "",
          image: "",
        }));
        setUploadPercent(() => ({
          video: 0,
          image: 0,
        }));
      }
      alert(data.message);
    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred')
    },
  });
  const handleClose = () => setShow(false);
  const HandleUpload = (e) => {
    e.preventDefault();
    if (
      videoData.title.trim() &&
      videoData.desc.trim() &&
      videoData.videoURL.trim() &&
      videoData.imgURL.trim()
    ) {
      videoUploadMutation.mutate(videoData);
    } else alert("Complete the Video Upload Form!");

    // console.log("videoData: ", videoData);
    // console.log("uploadFiles: ", uploadFiles)
  };
  const UploadFileToFirebase = (file, fileType) => {
    const storage = getStorage(app);
    const storageRef = ref(storage, new Date().getTime() + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log('Upload is ' + progress + '% done');
        fileType === "image"
          ? setUploadPercent((prev) => ({
              ...prev,
              image: Math.floor(progress),
            }))
          : setUploadPercent((prev) => ({
              ...prev,
              video: Math.floor(progress),
            }));
        switch (snapshot.state) {
          case "paused":
            // console.log('Upload is paused');
            break;
          case "running":
            // console.log('Upload is running');
            break;
        }
      },
      (error) => {
        alert(error);
        // Handle unsuccessful uploads
      },
      // Handle successful uploads on complete
      () => {
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // console.log('File available at', downloadURL);
          fileType === "video"
            ? setVideoData((prev) => ({ ...prev, videoURL: downloadURL }))
            : setVideoData((prev) => ({ ...prev, imgURL: downloadURL }));
        });
      }
    );
  };

  useEffect(() => {
    if (uploadFiles.video) UploadFileToFirebase(uploadFiles.video, "video");
  }, [uploadFiles.video]);

  useEffect(() => {
    if (uploadFiles.image) UploadFileToFirebase(uploadFiles.image, "image");
  }, [uploadFiles.image]);

  // console.log("modal it is.")
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container mt-4">
            <h2 className="text-center mb-4">Video Upload Form</h2>
            <form>
              <div className="card p-3 mb-3">
                <div className="form-group">
                  <p>Video Upload</p>
                  <input
                    type="file"
                    className="form-control-file"
                    id="videoInput"
                    onChange={(e) =>
                      setUploadFiles((prev) => ({
                        ...prev,
                        video: e.target.files[0],
                      }))
                    }
                  />
                </div>
                <br />
                {uploadPercent.video > 0 ? (
                  <p>Upload Percentage: {uploadPercent.video}%</p>
                ) : (
                  ""
                )}
              </div>
              <div className="card p-3 mb-3">
                <div className="form-group">
                  <p>Upload Image</p>
                  <input
                    type="file"
                    className="form-control-file"
                    id="videoImage"
                    onChange={(e) =>
                      setUploadFiles((prev) => ({
                        ...prev,
                        image: e.target.files[0],
                      }))
                    }
                  />
                </div>
                <br />
                {uploadPercent.image > 0 ? (
                  <p>Upload Percentage: {uploadPercent.image}%</p>
                ) : (
                  ""
                )}
              </div>
              <div className="card p-3 mb-3">
                <div className="form-group">
                  <label htmlFor="titleInput">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="titleInput"
                    placeholder="Enter title"
                    value={videoData.title}
                    onChange={(e) =>
                      setVideoData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="card p-3 mb-3">
                <div className="form-group">
                  <label htmlFor="descriptionTextarea">Description</label>
                  <textarea
                    className="form-control"
                    id="descriptionTextarea"
                    rows={3}
                    placeholder="Enter description"
                    value={videoData.desc}
                    onChange={(e) =>
                      setVideoData((prev) => ({
                        ...prev,
                        desc: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="card p-3 mb-3">
                <div className="form-group">
                  <label htmlFor="tagsInput">Tags</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tagsInput"
                    placeholder="Enter comma separated tags."
                    value={videoData.tags.join(",")}
                    onChange={(e) =>
                      setVideoData((prev) => ({
                        ...prev,
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim()),
                      }))
                    }
                  />
                </div>
              </div>
            </form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={HandleUpload}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UploadModal;
