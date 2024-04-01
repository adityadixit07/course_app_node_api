import DataUriParser from "datauri/parser.js";
import path from "path";

const dataUri = (thumbnail) => {
  const parser = new DataUriParser();
  const extName = path.extname(thumbnail.originalname).toString();
  return parser.format(extName, thumbnail.buffer);
};

export default dataUri;
