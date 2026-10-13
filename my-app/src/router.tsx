import { createBrowserRouter } from 'react-router'
import { AppShell, type ShellHandle } from './components/AppShell'
import { GuestOnly, RequireAuth } from './components/RouteGuards'
import EditProject from './routes/EditProject'
import ForgotPassword from './routes/ForgotPassword'
import Home from './routes/Home'
import NewProject from './routes/NewProject'
import NotFound from './routes/NotFound'
import ProjectDetail from './routes/ProjectDetail'
import SignIn from './routes/SignIn'
import SignUp from './routes/SignUp'

const header = (fn: ShellHandle['header']): ShellHandle => ({ header: fn })

export const router = createBrowserRouter([
  { path: '/', element: <GuestOnly><SignIn /></GuestOnly> },
  { path: '/signup', element: <GuestOnly><SignUp /></GuestOnly> },
  { path: '/forgot-password', element: <GuestOnly><ForgotPassword /></GuestOnly> },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { path: '/home', element: <Home />, handle: header(() => ({ title: 'Home' })) },
      { path: '/projects/new', element: <NewProject />, handle: header(() => ({ title: 'New project', back: '/home' })) },
      {
        path: '/projects/:projectId',
        element: <ProjectDetail />,
        handle: header(({ params, getProject }) => ({ title: getProject(params.projectId)?.name ?? 'Project', back: '/home' })),
      },
      {
        path: '/projects/:projectId/edit',
        element: <EditProject />,
        handle: header(({ params }) => ({ title: 'Edit project', back: `/projects/${params.projectId}` })),
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])
