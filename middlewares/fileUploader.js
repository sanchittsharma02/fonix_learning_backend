const multer=require("multer")


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === "image/png") {
      cb(null, "./public/images");
    } else {
      cb(null, "./uploads");
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

function imageFilter(req, file, cb) {
  const allowed = /jpg|png|jpeg/;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg ,png ,jpeg are allowed"), false);
  }
}

const upload = multer({ storage, fileFilter: imageFilter });

module.exports=upload