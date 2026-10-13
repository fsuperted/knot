import { useNavigate } from 'react-router'
import { ProjectForm } from '../components/project/ProjectForm'
import { useToast } from '../components/Toast'
import { emptyDraft } from '../lib/projectModel'
import { useProjects } from '../lib/projects'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function NewProject() {
  useDocumentTitle('New project')
  const { projects, createProject } = useProjects()
  const navigate = useNavigate()
  const toast = useToast()
  const first = projects.length === 0

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm text-text-muted">{first ? 'Your first project' : 'New project'}</p>
      <h1 className="mt-1 text-3xl font-semibold text-text">Set up a project</h1>
      <p className="mt-2 max-w-2xl text-sm text-text-muted">
        Only the name is required. Everything else helps Knot remind you at the right time and track what matters —
        you can change it later.
      </p>
      <div className="mt-8">
        <ProjectForm
          initial={emptyDraft()}
          submitLabel="Create project"
          cancelTo="/home"
          onSubmit={async (draft) => {
            const project = await createProject(draft)
            toast(`“${project.name}” is ready.`)
            navigate(`/projects/${project.id}`, { replace: true })
          }}
        />
      </div>
    </div>
  )
}
