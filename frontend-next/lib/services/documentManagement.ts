import { api } from '../api';

export interface DocumentChunkSchema {
  chunk_id: string;
  document_id: string;
  document_version: number;
  section_id: string;
  section_title?: string | null;
  heading?: string | null;
  page_number?: number | null;
  paragraph_reference?: string | null;
  chunk_text: string;
  chunk_index: number;
  token_count?: number | null;
  contains_adversarial_flag: boolean;
}

export interface DocumentMetadataResponse {
  document_id: string;
  title: string;
  description?: string | null;
  category: string;
  department?: string | null;
  version: number;
  effective_date: string;
  expiry_date?: string | null;
  status: string;
  file_format: string;
  file_size_bytes: number;
  content_hash: string;
  precedence_rank: number;
  supersedes_document_id?: string | null;
  created_at: string;
  total_chunks: number;
  adversarial_flags_count: number;
  processing_status: string;
}

export interface DocumentUploadResponse {
  message: string;
  document: DocumentMetadataResponse;
  chunks_count: number;
  superseded_previous_version: boolean;
}

export interface DocumentVersionSummaryResponse {
  document_id: string;
  version: number;
  title: string;
  status: string;
  file_format: string;
  effective_date: string;
  created_at: string;
  is_active: boolean;
}

export interface DocumentProcessingJobSchema {
  job_id?: string;
  document_id: string;
  document_version: number;
  status: string;
  error_message?: string | null;
  total_chunks: number;
  adversarial_flags_count: number;
  processed_at?: string;
}

export interface DocumentActivateResponse {
  message: string;
  document_id: string;
  activated_version: number;
  previous_active_version?: number | null;
}

export interface DocumentFetchParams {
  category?: string;
  department?: string;
  status_filter?: string;
  search?: string;
}

// Service Functions
export async function fetchDocuments(params?: DocumentFetchParams): Promise<DocumentMetadataResponse[]> {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.department) queryParams.append('department', params.department);
  if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
  if (params?.search) queryParams.append('search', params.search);

  const url = `/api/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return api.get<DocumentMetadataResponse[]>(url);
}

export async function fetchDocument(documentId: string): Promise<DocumentMetadataResponse> {
  return api.get<DocumentMetadataResponse>(`/api/documents/${documentId}`);
}

export async function fetchDocumentVersions(documentId: string): Promise<DocumentVersionSummaryResponse[]> {
  return api.get<DocumentVersionSummaryResponse[]>(`/api/documents/${documentId}/versions`);
}

export async function fetchDocumentChunks(documentId: string): Promise<DocumentChunkSchema[]> {
  return api.get<DocumentChunkSchema[]>(`/api/documents/${documentId}/chunks`);
}

export async function fetchVersionChunks(documentId: string, version: number): Promise<DocumentChunkSchema[]> {
  return api.get<DocumentChunkSchema[]>(`/api/documents/${documentId}/versions/${version}/chunks`);
}

export async function uploadDocument(formData: FormData): Promise<DocumentUploadResponse> {
  return api.post<DocumentUploadResponse>('/api/documents/upload', formData);
}

export async function reprocessDocumentVersion(
  documentId: string,
  version: number
): Promise<DocumentProcessingJobSchema> {
  return api.post<DocumentProcessingJobSchema>(`/api/documents/${documentId}/versions/${version}/process`, {});
}

export async function activateDocumentVersion(
  documentId: string,
  version: number
): Promise<DocumentActivateResponse> {
  return api.post<DocumentActivateResponse>(`/api/documents/${documentId}/versions/${version}/activate`, {});
}
