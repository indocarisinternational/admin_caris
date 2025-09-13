import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';
import PrivateRoute from './PrivateRoute';
import Pegawais from 'src/views/pegawai/Pegawais';
import AddPegawais from 'src/views/pegawai/AddPegawais';
import EditPegawais from 'src/views/pegawai/EditPegawais';
import Assignment from 'src/views/assignment/Assignment';
import AddAssignment from 'src/views/assignment/AddAssignment';
import EditAssignment from 'src/views/assignment/EditAssignment';

// Layouts
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Pages
const Dashboard = Loadable(lazy(() => import('../views/dashboards/Dashboard')));
const Project = Loadable(lazy(() => import('../views/projects/Project')));
const Addproject = Loadable(lazy(() => import('../views/projects/Addproject')));
const Editproject = Loadable(lazy(() => import('../views/projects/Editproject')));
const Blog = Loadable(lazy(() => import('../views/blogs/Blog')));
const Addblog = Loadable(lazy(() => import('../views/blogs/AddBlog')));
const Editblog = Loadable(lazy(() => import('../views/blogs/EditBlog')));
const Client = Loadable(lazy(() => import('../views/clients/Client')));
const Addclient = Loadable(lazy(() => import('../views/clients/AddClient')));
const Editclient = Loadable(lazy(() => import('../views/clients/EditClient')));

// Auth
const Login = Loadable(lazy(() => import('../views/auth/login/Login')));
const Register = Loadable(lazy(() => import('../views/auth/register/Register')));
const Error = Loadable(lazy(() => import('../views/auth/error/Error')));

const Router = [
  {
    path: '/',
    element: (
      <PrivateRoute>
        <FullLayout />
      </PrivateRoute>
    ), // Protect the FullLayout
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/projects', element: <Project /> },
      { path: '/add/project', element: <Addproject /> },
      { path: '/edit/project/:id', element: <Editproject /> },
      { path: '/pegawais', element: <Pegawais /> },
      { path: '/add/pegawai', element: <AddPegawais /> },
      { path: '/edit/pegawai/:id', element: <EditPegawais /> },
      { path: '/assignments', element: <Assignment /> },
      { path: '/add/assignment', element: <AddAssignment /> },
      { path: '/edit/assignment/:id', element: <EditAssignment /> },
      { path: '/blogs', element: <Blog /> },
      { path: '/add/blog', element: <Addblog /> },
      { path: '/edit/blog/:id', element: <Editblog /> },
      { path: '/clients', element: <Client /> },
      { path: '/add/client', element: <Addclient /> },
      { path: '/edit/client/:id', element: <Editclient /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router, { basename: '/' });
export default router;
