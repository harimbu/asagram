const express = require('express')
const app = express()
const port = 3000

const admin = require('firebase-admin')
const serviceAccount = require('./key.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'quasagram-f8ff6.appspot.com'
})

const db = admin.firestore()
const Busboy = require('busboy')
const bucket = admin.storage().bucket()
const path = require('path')
const os = require('os')
const fs = require('fs')
const UUID = require('uuid-v4')

// endpoint - posts
app.get('/posts', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')
  const posts = []

  db.collection('posts').orderBy('date', 'desc').get().then(snapshot => {
    snapshot.forEach(doc => {
      posts.push(doc.data())
    })
    response.send(posts)
  })
})

// endpoint - Create post
app.post('/createPost', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const uuid = UUID()

  var busboy = new Busboy({ headers: request.headers })

  const fields = {}
  let fileData = {}

  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype)
    // /tmp/457512-452113.png
    const filepath = path.join(os.tmpdir(), filename)
    file.pipe(fs.createWriteStream(filepath))
    fileData = { filepath, mimetype }
  })

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    fields[fieldname] = val
  })

  busboy.on('finish', function () {
    bucket.upload(
      fileData.filepath,
      {
        uploadType: 'media',
        metadata: {
          metadate: {
            contentType: fileData.mimetype,
            firebasestorageDownloadTokens: uuid
          }
        }
      },
      (err, uploadedFile) => {
        if (!err) {
          createDocument(uploadedFile)
        }
      }
    )

    function createDocument (uploadedFile) {
      db.collection('posts').doc(fields.id).set({
        id: fields.id,
        caption: fields.caption,
        location: fields.location,
        date: parseInt(fields.date),
        imgUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}`
        // imgUrl: 'https://firebasestorage.googleapis.com/v0/b/quasagram-f8ff6.appspot.com/o/pFdK1rb.jpeg?alt=media&token=bc00881b-4fb0-4929-b5df-720224c11b33'
      }).then(() => {
        response.send('Post added: ' + fields.id)
      })
    }
  })

  request.pipe(busboy)
})

app.listen(process.env.PORT || port)
