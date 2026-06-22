const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage()
});

const supabase =
  require("../supabase");

router.post(
  "/id-proof",
  upload.single("file"),
  async (req, res) => {

    try {

      const file =
        req.file;

      if (!file) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "No file uploaded"
          });

      }

      const fileName =
        `${Date.now()}-${file.originalname}`;

      const { error } =
        await supabase
          .storage
          .from("idproofs")
          .upload(
            fileName,
            file.buffer,
            {
              contentType:
                file.mimetype
            }
          );

      if (error) {

        return res
          .status(500)
          .json(error);

      }

      const {
        data
      } =
        supabase
          .storage
          .from("idproofs")
          .getPublicUrl(
            fileName
          );

      res.json({
        success: true,
        url:
          data.publicUrl
      });

    } catch (err) {

      res.status(500).json({
        success: false,
        message:
          err.message
      });

    }

  }
);

module.exports =
  router;