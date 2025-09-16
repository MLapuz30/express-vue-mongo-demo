import { createRouter, createWebHistory } from 'vue-router';

import HomePage from '../pages/Home.vue';
import AdminPage from '../pages/Admin.vue';
import StudentPage from '../pages/Student.vue';
import AdminList from '../pages/AdminPage.vue';
import StudentList from '../pages/StudentPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
    {
    path: '/adminForm',
    name: 'Admin',
    component: AdminPage,
  },
    {
    path: '/studentForm',
    name: 'Student',
    component: StudentPage,
  },
    {
    path: '/admins',
    name: 'AdminList',
    component: AdminList,    
  },
    {
    path: '/students',
    name: 'StudentList',
    component: StudentList,    
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
