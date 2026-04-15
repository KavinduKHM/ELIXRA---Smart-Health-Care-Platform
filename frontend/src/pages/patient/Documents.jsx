import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import {
  deletePatientDocument,
  listPatientDocuments,
  uploadPatientDocument,
} from '../../services/patient.service';

export default function PatientDocuments() {
  const { patientId } = useAuth();
  const qc = useQueryClient();
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('LAB_REPORT');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const query = useQuery({
    queryKey: ['patientDocuments', patientId],
    queryFn: () => listPatientDocuments(patientId),
    enabled: Boolean(patientId),
  });

  const docs = Array.isArray(query.data) ? query.data : query.data?.content || query.data?.items || [];

  const uploadMutation = useMutation({
    mutationFn: (payload) => uploadPatientDocument(patientId, payload),
    onSuccess: () => {
      toast.success('Uploaded');
      setFile(null);
      setDescription('');
      setNotes('');
      qc.invalidateQueries({ queryKey: ['patientDocuments', patientId] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Upload failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ documentId }) => deletePatientDocument(patientId, documentId),
    onSuccess: () => {
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['patientDocuments', patientId] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Delete failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="mt-1 text-sm text-slate-600">Upload and manage your medical documents.</p>
      </div>

      <Card>
        <div className="text-sm font-bold">Upload</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select label="Document type" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
            <option value="LAB_REPORT">Lab report</option>
            <option value="PRESCRIPTION">Prescription</option>
            <option value="IMAGING">Imaging</option>
            <option value="OTHER">Other</option>
          </Select>
          <Input label="Choose file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <Input className="mt-4" label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input className="mt-4" label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="mt-4">
          <Button
            disabled={uploadMutation.isPending}
            onClick={() => {
              if (!file) {
                toast.error('Please choose a file');
                return;
              }
              uploadMutation.mutate({ file, documentType, description: description || null, notes: notes || null });
            }}
          >
            {uploadMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Uploading
              </span>
            ) : (
              'Upload'
            )}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-bold">Your documents</div>
        <div className="mt-4">
          {query.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Spinner /> Loading
            </div>
          ) : query.error ? (
            <div className="text-sm text-rose-600">Failed to load documents.</div>
          ) : docs.length === 0 ? (
            <div className="text-sm text-slate-600">No documents uploaded yet.</div>
          ) : (
            <div className="space-y-3">
              {docs.map((d) => (
                <div key={d.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold">{d.fileName || `Document #${d.id}`}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-600">{d.documentType || '—'}</div>
                      {d.fileUrl ? (
                        <a className="mt-1 block text-sm font-semibold text-sky-700 hover:text-sky-800" href={d.fileUrl} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      ) : null}
                    </div>
                    <Button
                      variant="danger"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate({ documentId: d.id })}
                    >
                      Delete
                    </Button>
                  </div>
                  {d.description ? <div className="mt-2 text-sm text-slate-700">{d.description}</div> : null}
                  {d.notes ? <div className="mt-1 text-sm text-slate-700">{d.notes}</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
