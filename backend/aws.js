require("dotenv").config();
const aws = require("aws-sdk");
const fs = require("fs");

const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new aws.S3({
  region: process.env.AWS_BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  signatureVersion: "v4",
  maxRetries: 10,
});

//Upload Videos to s3

async function largeFileUpload(file) {
  const fileStream = fs.createReadStream(file.path);

  let largeUploadParams = await s3
    .createMultipartUpload({
      Bucket: bucketName,
      Key: file.filename,
    })
    .promise();

  let chunkCount = 1;
  let uploadPartResults = [];

  fs.open(fileStream.path, "r", async function (err, fd) {
    if (err) throw err;

    function readNextChunk() {
      fs.read(fd, buffer, 0, CHUNK_SIZE, null, async function (err, nread) {
        if (err) throw err;

        if (nread === 0) {
          // done reading file, do any necessary finalization steps
          fs.close(fd, function (err) {
            if (err) throw err;
          });
          return;
        }

        var data;

        if (nread < CHUNK_SIZE) {
          data = buffer.slice(0, nread);
        } else {
          data = buffer;
        }

        let uploadPromiseResult = await s3
          .uploadPart({
            Body: data,
            Bucket: bucketName,
            Key: file.filename,
            PartNumber: chunkCount,
            UploadId: largeUploadParams.UploadId,
          })
          .promise();

        uploadPartResults.push({
          PartNumber: chunkCount,
          ETag: uploadPromiseResult.ETag,
        });

        chunkCount++;

        readNextChunk();
      });
    }

    readNextChunk();
    let completeUploadResponce = await s3
      .completeMultipartUpload({
        Bucket: bucketName,
        Key: file.filename,
        MultipartUpload: {
          Parts: uploadPartResults,
        },
        UploadId: largeUploadParams.UploadId,
      })
      .promise();
  });
}
exports.largeFileUpload = largeFileUpload;

function uploadVideo(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadVideoParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };
  const options = {
    partSize: 10 * 1024 * 1024,
    queueSize: 5,
  };

  return s3.upload(uploadVideoParams, options).promise();
}

exports.uploadVideo = uploadVideo;

//UploadsPhotos

function uploadPhotos(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
}

exports.uploadPhotos = uploadPhotos;

//Download from s3

function getFileSteam(fileKey, UploadId) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  //   return s3.listParts(downloadParams).createReadStream();
  return s3.getObject(downloadParams).createReadStream();
}
exports.getFileSteam = getFileSteam;

//Delete from s3

function deleteFile(fileKey) {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileKey,
  };
  return s3.deleteObject(deleteParams).promise();
}

exports.deleteFile = deleteFile;
