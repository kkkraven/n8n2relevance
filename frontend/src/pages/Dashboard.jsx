import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'

function uploadFile({ file, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'https://httpbin.org/post')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error('upload failed'))
      }
    }
    xhr.onerror = () => reject(new Error('upload failed'))
    const formData = new FormData()
    formData.append('file', file)
    xhr.send(formData)
  })
}

export default function Dashboard() {
  const [history, setHistory] = useState([])
  const mutation = useMutation({
    mutationFn: ({ file, onProgress }) => uploadFile({ file, onProgress }),
  })

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const entry = { id: Date.now() + file.name, name: file.name, progress: 0, status: 'uploading' }
      setHistory((h) => [...h, entry])
      mutation.mutate(
        { file, onProgress: (p) => setHistory((h) => h.map((e) => e.id === entry.id ? { ...e, progress: Math.round(p * 100) } : e)) },
        {
          onSuccess: () => setHistory((h) => h.map((e) => e.id === entry.id ? { ...e, status: 'done', progress: 100 } : e)),
          onError: () => setHistory((h) => h.map((e) => e.id === entry.id ? { ...e, status: 'error' } : e)),
        }
      )
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div>
      <h2>Dashboard</h2>
      <div {...getRootProps()} style={{ border: '2px dashed gray', padding: 20, textAlign: 'center' }}>
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
      </div>
      <h3>Upload History</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>File</th>
            <th>Status</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.status}</td>
              <td>{item.progress}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
