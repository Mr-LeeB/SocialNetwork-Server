const cors = require("cors");
const aws = require("aws-sdk");
const express = require("express");
const configAWS = require("./config.json");
const axios = require("axios");

const app = express();
app.use(cors());
app.get("/upload", async (req, res) => {
  const s3 = new aws.S3();
  const { fileName } = req.body;
  const { fileType } = req.body;
  const s3Params = {
    Bucket: configAWS.BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: "public-read",
  };

  let returnData = {};

  s3.getSignedUrl("putObject", s3Params, (err, data) => {
    if (err) {
      console.log(`getSignedUrl error: `, err);
      return res.end();
    }
    returnData = {
      uploadRequest: data,
      url: `https://${configAWS.BUCKET}.s3.amazonaws.com/${fileName}`,
    };
  });

  try {
    const { data } = await axios.put(returnData.signedRequest, file, {
      headers: { "Content-Type": file.type },
    });

    console.log(`Upload succeed to: ${returnData.url}`);
    res.status(200).send("File uploaded successfully.");
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, () => {
  console.log("come here babe...");
});
