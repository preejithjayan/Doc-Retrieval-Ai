import { useState } from 'react';

import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import documentService from '../services/documentService';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const runSearch = async (event) => {
    event.preventDefault();
    const { data } = await documentService.search({ query, top_k: 8 });
    setResults(data.results || []);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Semantic Search"
        title="Search indexed content by meaning"
        description="Query the vector store directly to inspect the top matching chunks before sending the same question into the chatbot."
        details={['Top-k retrieval', 'Chunk previews', 'Similarity score', 'Citation source']}
      />

      <section className="panel px-6 py-5">
        <p className="text-sm font-semibold text-console-text">Query the vector index</p>
        <p className="mt-1 text-xs text-console-muted">Use natural language topics, concepts, clauses, or incident summaries.</p>
        <div className="mt-4">
          <SearchBar value={query} onChange={setQuery} onSubmit={runSearch} placeholder="Search for concepts, contract clauses, policy statements, or case facts..." />
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-console-border bg-slate-50 px-5 py-4">
          <p className="text-sm font-semibold text-console-text">Search results</p>
          <p className="mt-1 text-xs text-console-muted">Results are ordered by vector similarity score.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {results.length === 0 ? (
            <div className="px-5 py-8 text-sm text-console-muted">No results yet. Run a semantic search to inspect indexed chunks.</div>
          ) : (
            results.map((result, index) => (
              <div key={`${result.document_id}-${index}`} className="px-5 py-4 hover:bg-slate-50/70">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-console-blue">{result.file_name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-console-muted">Chunk {result.chunk_index}</p>
                  </div>
                  <span className="tag-muted">Score {Math.round((result.score || 0) * 100)}%</span>
                </div>
                <p className="mt-3 max-w-5xl text-sm leading-7 text-console-muted">{result.snippet}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

