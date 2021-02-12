<template>
  <q-page class="wrap-more q-pa-md">
    <div class="camera-frame q-pa-md">
      <video
        v-show="!imageCaptured"
        ref="video"
        class="full-width"
        autoplay
      />
      <canvas
        v-show="imageCaptured"
        ref="canvas"
        class="full-width"
        height="240px"
      />
    </div>
    <div class="text-center q-pa-md">
      <q-btn
        v-if="hasCameraSupport"
        @click="captureImage"
        :disable="imageCaptured"
        color="grey-10"
        icon="eva-camera"
        size="18px"
        round
      />
      <!-- TODO : q-file API확인 -->
      <q-file
        v-else
        outlined
        @input="captureImageFallback"
        v-model="uploadImage"
        label="Choose a image..."
        accept="image/*"
      >
        <template v-slot:prepend>
          <q-icon name="eva-attach-outline" />
        </template>
      </q-file>
    </div>

    <div class="row justify-center q-ma-md">
      <div class="col col-sm-6">
        <q-input dense label="caption *" v-model="post.caption" />
      </div>
    </div>
    <div class="row justify-center q-ma-md">
      <div class="col col-sm-6">
        <q-input dense label="location *" v-model="post.location" :loading="loadingState">
          <template v-slot:append v-if="!loadingState && locationSupported">
            <q-btn @click="getLocation" round dense flat color="grey" icon="eva-navigation-2-outline" />
          </template>
        </q-input>
      </div>
    </div>
    <div class="text-center q-mt-lg">
      <q-btn
        @click="addPost"
        :disable="!post.caption || !post.photo || !post.location"
        color="primary"
        label="Upload Image"
        rounded
        unelevated
      />
    </div>
  </q-page>
</template>

<script>
import { uid } from 'quasar'
require('md-gum-polyfill') // TODO: ie-11 폴리필

export default {
  name: 'PageIndex',
  data () {
    return {
      post: {
        id: uid(),
        caption: '',
        location: '',
        photo: null,
        date: Date.now()
      },
      imageCaptured: false,
      uploadImage: [],
      hasCameraSupport: true,
      loadingState: false
    }
  },
  mounted () {
    this.initCamera()
  },
  beforeDestroy () {
    this.disableCamera()
  },
  computed: {
    locationSupported () {
      if ('geolocation' in navigator) return true
      return false
    }
  },
  methods: {
    initCamera () {
      navigator.mediaDevices.getUserMedia({
        video: true
      }).then(stream => {
        this.$refs.video.srcObject = stream
      }).catch(() => {
        this.hasCameraSupport = false
      })
    },
    captureImage () {
      const video = this.$refs.video
      const canvas = this.$refs.canvas
      // canvas.width = video.videoWidth
      // canvas.height = video.videoHeight
      canvas.width = video.getBoundingClientRect().width
      canvas.height = video.getBoundingClientRect().height
      const context = canvas.getContext('2d')
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      this.imageCaptured = true
      this.post.photo = this.dataURItoBlob(canvas.toDataURL())
      this.disableCamera()
    },
    captureImageFallback (file) {
      this.post.photo = file

      const canvas = this.$refs.canvas
      const context = canvas.getContext('2d')

      var reader = new FileReader()
      reader.onload = event => {
        var img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          context.drawImage(img, 0, 0)
          this.imageCaptured = true
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    },
    disableCamera () {
      this.$refs.video.srcObject.getTracks().forEach(track => {
        track.stop()
      })
    },
    // TODO:Uri to blod
    dataURItoBlob (dataURI) {
      var byteString = atob(dataURI.split(',')[1])
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
      var ab = new ArrayBuffer(byteString.length)
      var ia = new Uint8Array(ab)
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      var blob = new Blob([ab], { type: mimeString })
      return blob
    },
    getLocation () {
      this.loadingState = true
      navigator.geolocation.getCurrentPosition(position => {
        this.getCityAndCountry(position)
      }, () => {
        this.locationError()
      }, { timeout: 7000 })
    },
    getCityAndCountry (position) {
      const apiUrl = `https://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1`
      this.$axios.get(apiUrl).then(result => {
        this.post.location = `${result.data.city}, ${result.data.country}`
        this.loadingState = false
      }).catch(() => {
        this.locationError()
      })
    },
    locationError () {
      this.$q.dialog({
        title: '연결실패',
        message: '인터넷 연결을 확인하세요'
      })
      this.loadingState = false
    },
    addPost () {
      this.$q.loading.show()

      const formData = new FormData()
      formData.append('id', this.post.id)
      formData.append('caption', this.post.caption)
      formData.append('location', this.post.location)
      formData.append('date', this.post.date)
      formData.append('file', this.post.photo, this.post.id + '.png')

      this.$axios.post(`${process.env.API}/createPost`, formData).then(response => {
        console.log(response)
        this.$router.push('/')
        this.$q.notify({
          message: 'Post created!',
          color: 'success',
          avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          actions: [
            { label: 'Dismiss', color: 'white' }
          ]
        })
        this.$q.loading.hide()
      }).catch(error => {
        console.log(error)
        this.$q.dialog({
          title: '알림',
          message: '사진을 업로드 할 수 없습니다.'
        })
        this.$q.loading.hide()
      })
    }
  }
}
</script>
<style lang="sass">
.camera-frame
  border: 2px solid $grey-10
  border-radius: 10px
</style>
