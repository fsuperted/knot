import { useNavigate, useParams } from 'react-router'
import { ProjectForm } from '../components/project/ProjectForm'
import { useToast } from '../components/Toast'
import { useProjects, type Project, type ProjectDraft } from '../lib/projects'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { ProjectMissing } from './ProjectDetail'

const toDraft = ({ id: _id, createdAt: _c, updatedAt: _u, ...draft }: Project): ProjectDraft => draft

export default function EditProject() {
  const { projectId } = useParams()
  const { getProject, updateProject, deleteProject } = useProjects()
  const project = getProject(projectId)
  const navigate = useNavigate()
  const toast = useToast()
  useDocumentTitle(project ? `Edit ${project.name}` : 'Project not found')

  if (!project) return <ProjectMissing />

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm text-text-muted">Edit project</p>
      <h1 className="mt-1 text-3xl font-semibold text-text">{project.name}</h1>
      <div className="mt-8">
        <ProjectForm
          // Remount if the project changes underneath (e.g. navigating between edits).
          key={project.id}
          initial={toDraft(project)}
          submitLabel="Save changes"
          cancelTo={`/projects/${project.id}`}
          onSubmit={async (draft) => {
            await updateProject(project.id, draft)
            toast('Changes saved.')
            navigate(`/projects/${project.id}`, { replace: true })
          }}
          onDelete={() => {
            navigate('/home', { replace: true })
            deleteProject(project.id)
            toast(`“${project.name}” was deleted.`)
          }}
        />
      </div>
    </div>
  )
}
