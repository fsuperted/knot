import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { ToastProvider } from './components/Toast'
import { AmbientProvider } from './lib/ambient'
import { AuthProvider } from './lib/auth'
import { ProjectsProvider } from './lib/projects'
import { router } from './router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AmbientProvider>
      <AuthProvider>
        <ProjectsProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </ProjectsProvider>
      </AuthProvider>
    </AmbientProvider>
  </StrictMode>,
)
