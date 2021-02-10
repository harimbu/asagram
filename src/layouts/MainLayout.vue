<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-grey-10" bordered>
      <q-toolbar class="wrap">
        <q-btn flat dense round icon="eva-home-outline" class="q-mr-sm large-only" to="/" />
        <q-separator vertical class="q-mx-sm large-only" />
        <q-toolbar-title class="font-title text-bold">Asagram</q-toolbar-title>
        <q-btn flat dense round icon="eva-camera-outline" class="large-only" to="/camera" />
      </q-toolbar>
    </q-header>

      <q-footer bordered class="bg-white text-grey-10 small-only">
        <q-tabs active-color="primary" indicator-color="transparent">
          <q-route-tab to="/" icon="eva-home-outline" />
          <q-route-tab to="/camera" icon="eva-camera-outline" />
        </q-tabs>
      </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',
  data () {
    return {
    }
  }
}
</script>
<style lang="sass">
.q-toolbar
  @media (min-width: $breakpoint-xs-max)
    height: 70px
  .q-icon
    font-size: 26px

.q-toolbar__title
  font-size: 30px
  letter-spacing: 1px
  @media (max-width: $breakpoint-xs-max)
    text-align: center

.q-tab__icon
  font-size: 26px

</style>
