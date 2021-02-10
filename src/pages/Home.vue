<template>
  <q-page class="wrap q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <template v-if="!loadingPost && posts.length">
          <q-card v-for="post in posts" :key="post.id" class="my-card q-mb-md" bordered flat>
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>Lady__Gaga</q-item-label>
                <q-item-label caption>{{post.location}}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <q-img
              :src="post.imgUrl"
            />

            <q-card-section>
              <div>{{post.caption}}</div>
              <div class="text-caption text-grey">{{post.date | niceDate(post.date)}}</div>
            </q-card-section>
          </q-card>
        </template>
        <template v-else-if="!loadingPost && !posts.length">
          <h6 class="text-center text-grey">데이타가 없습니다.</h6>
        </template>
        <template v-else>
          <q-card flat bordered>
            <q-item>
              <q-item-section avatar>
                <q-skeleton type="QAvatar" animation="fade" size="40px" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
                <q-item-label caption>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-skeleton height="200px" square animation="fade" />

            <q-card-section>
              <q-skeleton type="text" class="text-subtitle2" animation="fade" />
              <q-skeleton type="text" width="50%" class="text-subtitle2" animation="fade" />
            </q-card-section>
          </q-card>
        </template>
      </div>
      <div class="col-4 large-only">
        <q-item>
          <q-item-section avatar>
            <q-avatar size="50px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Lady_Gaga</q-item-label>
            <q-item-label caption>San Francisco, United Statte</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>

  </q-page>
</template>

<script>
import { date } from 'quasar'
export default {
  name: 'Home',
  data () {
    return {
      posts: [],
      loadingPost: false
    }
  },
  created () {
    this.getPost()
  },
  methods: {
    getPost () {
      this.loadingPost = true
      this.$axios.get(`${process.env.API}/posts`).then(res => {
        this.posts = res.data
        this.loadingPost = false
      }).catch(() => {
        this.$q.dialog({
          title: '알림',
          message: '데이타에 연결할 수 없습니다.'
        })
        this.loadingPost = false
      })
    }
  },
  filters: {
    niceDate (value) {
      return date.formatDate(value, 'YYYY.MM.DD ddd HH:mm:ss a')
    }
  }
}
</script>
