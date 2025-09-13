export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}

import { uniqueId } from 'lodash';

const SidebarContent: MenuItem[] = [
  {
    heading: 'HOME',
    children: [
      {
        name: 'Dashboard',
        icon: 'solar:widget-add-line-duotone',
        id: uniqueId(),
        url: '/',
      },
    ],
  },
  {
    heading: 'PEGAWAI',
    children: [
      {
        name: 'Data Pegawai',
        icon: 'solar:users-group-rounded-linear',
        id: uniqueId(),
        url: '/pegawais',
      },
      {
        name: 'Assignments',
        icon: 'solar:users-group-rounded-linear',
        id: uniqueId(),
        url: '/assignments',
      },
    ],
  },
  {
    heading: 'UTILITIES',
    children: [
      {
        name: 'Projects',
        icon: 'solar:text-circle-outline',
        id: uniqueId(),
        url: '/projects',
      },
      {
        name: 'Blogs',
        icon: 'solar:bedside-table-3-linear',
        id: uniqueId(),
        url: '/blogs',
      },
      {
        name: 'Clients',
        icon: 'solar:password-minimalistic-outline',
        id: uniqueId(),
        url: '/clients',
      },
      // {
      //   name: "Shadow",
      //   icon: "solar:airbuds-case-charge-outline",
      //   id: uniqueId(),
      //   url: "/ui/shadow",
      // },
    ],
  },
  // {
  //   heading: "AUTH",
  //   children: [
  //     {
  //       name: "Login",
  //       icon: "solar:login-2-linear",
  //       id: uniqueId(),
  //       url: "/auth/login",
  //     },
  //     {
  //       name: "Register",
  //       icon: "solar:shield-user-outline",
  //       id: uniqueId(),
  //       url: "/auth/register",
  //     },
  //   ],
  // },
  // {
  //   heading: "EXTRA",
  //   children: [
  //     {
  //       name: "Icons",
  //       icon: "solar:smile-circle-outline",
  //       id: uniqueId(),
  //       url: "/icons/solar",
  //     },
  //     {
  //       name: "Sample Page",
  //       icon: "solar:notes-minimalistic-outline",
  //       id: uniqueId(),
  //       url: "/sample-page",
  //     },
  //   ],
  // },
];

export default SidebarContent;
