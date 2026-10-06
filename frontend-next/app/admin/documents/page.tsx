'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import {
  fetchDocuments,
  reprocessDocumentVersion,
  activateDocumentVersion,
  DocumentMetadataResponse,
} from '@/lib/services/documentManagement';

import { DocumentLibraryHeader } from '@/components/documents/DocumentLibraryHeader';
import { DocumentStats } from '@/components/documents/DocumentStats';
import { DocumentFilters } from '@/components/documents/DocumentFilters';
import { DocumentTable } from '@/components/documents/DocumentTable';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { DocumentDetailModal } from '@/components/documents/DocumentDetailModal';
import { RecentDocumentActivity } from '@/components/documents/RecentDocumentActivity';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentMetadataResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [securityFilter, setSecurityFilter] = useState('all');

  // Modals & Actions
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentMetadataResponse | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadDocumentsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch document library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      try {
        const docs = await fetchDocuments();
        if (isMounted) {
          setDocuments(docs);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load documents');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSecurityFilter('all');
  };

  const handleReprocess = async (doc: DocumentMetadataResponse) => {
    setActionInProgress(doc.document_id);
    try {
      await reprocessDocumentVersion(doc.document_id, doc.version);
      await loadDocumentsList();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reprocess document version');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleActivate = async (doc: DocumentMetadataResponse) => {
    setActionInProgress(doc.document_id);
    try {
      await activateDocumentVersion(doc.document_id, doc.version);
      await loadDocumentsList();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to activate document version');
    } finally {
      setActionInProgress(null);
    }
  };

  // Filtered dataset
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.document_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || doc.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || doc.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSecurity =
      securityFilter === 'all' ||
      (securityFilter === 'flagged_only' && doc.adversarial_flags_count > 0) ||
      (securityFilter === 'clean_only' && doc.adversarial_flags_count === 0);

    return matchesSearch && matchesCategory && matchesStatus && matchesSecurity;
  });

  return (
    <AppLayout allowedRoles={['admin', 'training_manager', 'hr_manager', 'reviewer', 'compliance_manager', 'manager']}>
      <DashboardPageContainer>
        {/* Workspace Header */}
        <DocumentLibraryHeader
          onRefresh={loadDocumentsList}
          onOpenUpload={() => setIsUploadOpen(true)}
          loading={loading}
          totalCount={documents.length}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl mb-6 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadDocumentsList}
              className="px-3 py-1 bg-rose-600 text-white font-semibold text-xs rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Knowledge Base Statistics */}
        <DocumentStats documents={documents} loading={loading} />

        {/* Search & Filter Bar */}
        <DocumentFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          securityFilter={securityFilter}
          onSecurityChange={setSecurityFilter}
          onReset={handleResetFilters}
        />

        {/* Main Document Table */}
        <DocumentTable
          documents={filteredDocuments}
          loading={loading}
          onSelectDocument={(doc) => setSelectedDoc(doc)}
          onReprocess={handleReprocess}
          onActivate={handleActivate}
          actionInProgress={actionInProgress}
        />

        {/* Recent Activity Log */}
        <RecentDocumentActivity documents={documents} loading={loading} />

        {/* Upload Modal Dialog */}
        <DocumentUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={loadDocumentsList}
        />

        {/* Document Inspection / Detail Slide-Over Modal */}
        <DocumentDetailModal
          document={selectedDoc}
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onRefreshNeeded={loadDocumentsList}
        />
      </DashboardPageContainer>
    </AppLayout>
  );
}
