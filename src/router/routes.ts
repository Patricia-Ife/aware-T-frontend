/* eslint-disable @typescript-eslint/promise-function-async */
import { RouteRecordRaw } from 'vue-router'

const mainRoutes: RouteRecordRaw[] = [
  {
    name: "dashboard",
    path: "/",
    component: () => import("../views/home.vue"),
    meta: {
      title: "Home",
      requiresAuth: true,
    },
  },
  {
    name: "level",
    path: "/level",
    component: () => import("../views/level.vue"),
    meta: {
      title: "Level",
      requiresAuth: true,
    },
  },
  {
    name: "professor",
    path: "/professor",
    component: () => import("../views/professor.vue"),
    meta: {
      title: "Professor",
      requiresAuth: true,
    },
  },
  {
    name: "presence",
    path: "/presence",
    component: () => import("../views/presence.vue"),
    meta: {
      title: "Presence",
      requiresAuth: true,
    },
  },
  {
    name: "presence-details",
    path: "/presence/:id",
    component: () => import("../views/presence-details.vue"),
    meta: {
      title: "Presence",
      requiresAuth: true,
    },
  },
  {
    name: "course",
    path: "/course",
    component: () => import("../views/course.vue"),
    meta: {
      title: "Course",
      requiresAuth: true,
    },
  },
  {
    name: "course-details",
    path: "/course/:id",
    component: () => import("../views/course-details.vue"),
    meta: {
      title: "Course",
      requiresAuth: true,
    },
  },
  {
    name: "student",
    path: "/student",
    component: () => import("../views/student.vue"),
    meta: {
      title: "Students",
      requiresAuth: true,
    },
  },
  {
    name: "users",
    path: "/users",
    component: () => import("../views/users.vue"),
    meta: {
      title: "Users",
      requiresAuth: true,
    },
  },
  {
    name: "semester",
    path: "/semester",
    component: () => import("../views/semester.vue"),
    meta: {
      title: "Semester",
      requiresAuth: true,
    },
  },
  {
    name: "year",
    path: "/year",
    component: () => import("../views/year.vue"),
    meta: {
      title: "Year",
      requiresAuth: true,
    },
  },
];

const routes: RouteRecordRaw[] = [
  {
    name: 'login',
    path: '/login',
    component: () => import('../views/login.vue'),
    meta: {
      title: 'Sign In'
    }
  },
  {
    name: 'layout',
    path: '/',
    component: () => import('../layouts/index.vue'),
    children: [...mainRoutes]
  },
  // ## not found page
  {
    name: 'not-found',
    path: '/:path*',
    component: () => import('../views/error.vue'),
    meta: {
      title: 'Oh no!'
    }
  }
]

export default routes
