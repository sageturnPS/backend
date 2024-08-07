const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const dotenv = require('dotenv')
const fs = require('fs')

const AccessKey = process.env.AWS_ACCESS_KEY_ID
const SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const Bucket = process.env.AWS_S3_BUCKET

function cleanLink(url) {
  // Define a regular expression to match image extensions
  console.log(url)
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)(?=\W|$)/i

  // Use the exec method to find the match and get the index
  const match = imageExtensions.exec(url)
  if (match) {
    const extensionIndex = match.index + match[0].length
    // Return the URL truncated at the end of the image extension
    return url.substring(0, extensionIndex)
  }

  // If no image extension is found, return the URL as-is
  return url
}

const uploadAdToS3 = async (imageData, ad_id) => {
  console.log('TRYING S3 CONNECTION', AccessKey, SecretAccessKey)
  try {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: AccessKey,
        secretAccessKey: SecretAccessKey,
      },
    })

    const newAdName = `ads/Ad_${Date.now().toString()}_${ad_id}.jpeg`
    const image = imageData
    console.log(image, newAdName)
    const insertObjectParams = {
      Bucket: Bucket,
      Key: newAdName,
      Body: imageData,
      ContentType: 'image/jpeg',
    }

    const getObjectParams = {
      Bucket: Bucket,
      Key: newAdName,
    }

    // Send the image to the s3 bucket into ads folder
    let command = new PutObjectCommand(insertObjectParams)
    try {
      await s3.send(command)
    } catch (e) {
      console.error("THE SEND ISN'T SENDING", e)
    }

    // Retrieve the image url to return
    try {
      command = new GetObjectCommand(getObjectParams)
      const url = await getSignedUrl(s3, command)
      console.log(url)

      return cleanLink(url)
    } catch (e) {
      console.error('Image retrieval from S3 Error', e)
    }
  } catch (e) {
    console.error('Image Upload Error: ', e)
    throw e
  }
}

const uploadProfileImageToS3 = async (imageData, username) => {
  console.log(imageData)
  try {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: AccessKey,
        secretAccessKey: SecretAccessKey,
      },
      region: 'east-1',
    })

    const newProfilePicName = `profile_images/user_${username}.jpeg`
    const image = imageData

    const insertObjectParams = {
      Bucket: Bucket,
      Key: newProfilePicName,
      Body: image,
      ContentType: 'image/jpeg',
    }
    const getObjectParams = {
      Bucket: Bucket,
      Key: newProfilePicName,
    }
    // Send the image to the s3 bucket into ads folder
    let command = new PutObjectCommand(insertObjectParams)
    await s3.send(command)

    // Retrieve the image url to return
    command = new GetObjectCommand(getObjectParams)
    const url = await getSignedUrl(s3, command)

    return cleanLink(url)
  } catch (e) {
    console.error('Image Upload Error: ', e)
    throw e
  }
}

module.exports = {
  uploadAdToS3,
  uploadProfileImageToS3,
}
