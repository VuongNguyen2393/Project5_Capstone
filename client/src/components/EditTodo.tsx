import * as React from 'react'
import { Form, Button, Grid, Loader } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchTodo, getTodoDetail} from '../api/todos-api'
import { Todo } from '../types/Todo'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  file: any
  uploadState: UploadState
  todos: Todo
  loading: Boolean
  notes: string
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    todos: {todoId: '',
      createdAt: '',
      name: '',
      dueDate: '',
      done: false,
      attachmentUrl: '',
      notes: ''
    },
    loading: false,
    notes: ''  
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleNoteChange = (event: { target: { value: string } }) => {
    this.setState({
      notes: event.target.value
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }
      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.todoId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      await patchTodo(this.props.auth.getIdToken(), this.props.match.params.todoId, {
        name: this.state.todos.name,
        dueDate: this.state.todos.dueDate,
        done: this.state.todos.done,
        notes: this.state.notes
      })

      alert('File was uploaded!')
    } catch (e) {
      alert(`Could not upload a file: ${e}`)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  async componentDidMount() {
    try {
      const todos = await getTodoDetail(this.props.auth.getIdToken(), this.props.match.params.todoId)
      this.setState({
        todos,
        loading: true,
        notes: todos.notes
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  render() {
    if(!this.state.loading){
      return this.renderLoading()
    }
    return (
      <div>
        <h1>Upload new image</h1>
        <h2> TodoID: {this.props.match.params.todoId} </h2>
        <h2> TodoName: {this.state.todos.name}</h2>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>
          <Form.Field>
            <label>note</label>
            <textarea 
            value={this.state.notes}
            placeholder="description of the image"
            onChange={this.handleNoteChange}
            />
          </Form.Field>
          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }
}
