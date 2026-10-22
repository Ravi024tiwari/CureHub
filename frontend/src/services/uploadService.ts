import apiClient from './apiClient'

export interface UploadResult {
  url: string
  key: string
  originalName: string
  size: number
  mimeType: string
}

export const uploadService = {
  uploadTempFile: async (file: File, folder = 'temp/hospitals'): Promise<UploadResult> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const response = await apiClient.post<{ data: UploadResult }>('/upload/temp', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return (response as any)?.data || response
  },
}

export default uploadService
