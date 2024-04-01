import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./videos");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 100,
  },
}).single("video");

export default uploadVideo;

// upload for file upload



const storage1 = multer.memoryStorage();

export const uploadFile = multer({ storage1 }).single("thumbnail");
