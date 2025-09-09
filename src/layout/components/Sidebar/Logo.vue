<template>
  <div
    class="sidebar-logo-container"
    :class="{ collapse: collapse }"
    :style="{
      backgroundColor:
        sideTheme === 'theme-dark'
          ? variables.menuBackground
          : variables.menuLightBackground,
    }"
  >
    <transition name="sidebarLogoFade">
      <router-link
        v-if="collapse"
        key="collapse"
        class="sidebar-logo-link"
        to="/"
      >
        <img v-if="collapseLogo" :src="collapseLogo" class="sidebar-logo" />
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="expandLogo" :src="expandLogo" class="sidebar-logo" />
      </router-link>
    </transition>
  </div>
</template>

<script>
import logoImg from "@/assets/logo/logo.png";
import logoImgCollapse from "@/assets/logo/logo-collapse.png";
import variables from "@/assets/styles/variables.scss";

export default {
  name: "SidebarLogo",
  props: {
    collapse: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    variables() {
      return variables;
    },
    sideTheme() {
      return this.$store.state.settings.sideTheme;
    },
  },
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
      // 折叠状态下显示的logo（通常是小图标）
      collapseLogo: logoImgCollapse,
      // 展开状态下显示的logo（可以是完整的logo图片）
      expandLogo: logoImg,
    };
  },
};
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 60px;
  background: #2b2f3a;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex !important;
    align-items: center;
    justify-content: center;

    & .sidebar-logo {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
    }
  }

  &.collapse {
    .sidebar-logo {
      max-width: 80%;
      max-height: 80%;
    }
  }
}
</style>
