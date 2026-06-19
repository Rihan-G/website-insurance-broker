import { StatusPill } from 'frontend';

export const Tones = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '20px', alignItems: 'center' }}>
    <StatusPill label="Active" tone="success" />
    <StatusPill label="Pending" tone="warning" />
    <StatusPill label="Expired" tone="danger" />
    <StatusPill label="In Review" tone="info" />
    <StatusPill label="Neutral" tone="neutral" />
  </div>
);

export const WithIcon = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '20px', alignItems: 'center' }}>
    <StatusPill label="Policy Active" tone="success" icon={<span style={{ fontSize: '10px' }}>●</span>} />
    <StatusPill label="Renewal Due" tone="warning" icon={<span style={{ fontSize: '10px' }}>⚠</span>} />
    <StatusPill label="Claim Filed" tone="info" icon={<span style={{ fontSize: '10px' }}>ℹ</span>} />
  </div>
);

export const InContext = () => (
  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {[
      { policy: 'Motor Insurance – Toyota Corolla', tone: 'success' as const, label: 'Active' },
      { policy: 'Home Insurance – Port Louis', tone: 'warning' as const, label: 'Renewal Due' },
      { policy: 'Travel Insurance – Trip to France', tone: 'neutral' as const, label: 'Expired' },
      { policy: 'Life Insurance – Family Plan', tone: 'info' as const, label: 'Under Review' },
    ].map(row => (
      <div key={row.policy} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: '14px', color: 'var(--color-surface-foreground)' }}>{row.policy}</span>
        <StatusPill label={row.label} tone={row.tone} />
      </div>
    ))}
  </div>
);
