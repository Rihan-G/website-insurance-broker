import { EmptyState } from 'frontend';

const DocIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export const NoDocuments = () => (
  <div style={{ padding: '24px', maxWidth: '480px' }}>
    <EmptyState
      icon={DocIcon as any}
      title="No documents yet"
      description="Once your broker uploads policy documents, they'll appear here for you to view and download."
      actionLabel="Contact broker"
      onAction={() => {}}
    />
  </div>
);

export const NoResults = () => (
  <div style={{ padding: '24px', maxWidth: '480px' }}>
    <EmptyState
      icon={SearchIcon as any}
      title="No results found"
      description="We couldn't find any policies matching your search. Try adjusting your filters."
    />
  </div>
);

export const NoClients = () => (
  <div style={{ padding: '24px', maxWidth: '480px' }}>
    <EmptyState
      icon={UsersIcon as any}
      title="No clients assigned"
      description="You don't have any clients assigned to you yet. Contact your administrator to get started."
      actionLabel="View all clients"
      actionTo="/dashboard/clients"
    />
  </div>
);
