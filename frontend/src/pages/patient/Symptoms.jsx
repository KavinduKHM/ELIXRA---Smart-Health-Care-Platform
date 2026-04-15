import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { analyzeSymptoms } from '../../services/ai.service';

export default function PatientSymptoms() {
  const [symptoms, setSymptoms] = useState('');

  const analyzeMutation = useMutation({
    mutationFn: (payload) => analyzeSymptoms(payload),
    onError: (e) => {
      toast.error(e?.response?.data?.message || e?.message || 'Analysis failed');
    },
  });

  const result = analyzeMutation.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Symptom Checker</h1>
        <p className="mt-1 text-sm text-slate-600">Describe symptoms and get a guidance summary.</p>
      </div>

      <Card>
        <div className="text-sm font-bold">Symptoms</div>
        <div className="mt-3">
          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">What are you experiencing?</div>
            <textarea
              className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., fever, sore throat, headache for 2 days"
            />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button
            onClick={() => {
              if (!symptoms.trim()) {
                toast.error('Please enter symptoms');
                return;
              }
              analyzeMutation.mutate({ symptoms: symptoms.trim() });
            }}
            disabled={analyzeMutation.isPending}
          >
            {analyzeMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Analyzing
              </span>
            ) : (
              'Analyze'
            )}
          </Button>
          <Button variant="secondary" onClick={() => setSymptoms('')} disabled={analyzeMutation.isPending}>
            Clear
          </Button>
        </div>
      </Card>

      {result ? (
        <Card>
          <div className="text-sm font-bold">Result</div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-semibold text-slate-600">Urgency</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{result.urgencyLevel || '—'}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-semibold text-slate-600">Recommended specialty</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{result.recommendedSpecialty || '—'}</div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-600">Analysis</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{result.analysis || '—'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">Possible conditions</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{result.possibleConditions || '—'}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              {result.disclaimer || 'This tool is informational and not a medical diagnosis.'}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
