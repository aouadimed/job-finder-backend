const multer = require("multer");

const ApiError = require("../utils/apiError");

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("only images allowed", 400), false);
    }
  };

  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  });

  return upload;
};
const uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

const uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);

module.exports = { uploadSingleImage, uploadMixOfImages };