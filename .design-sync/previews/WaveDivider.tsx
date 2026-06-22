import { WaveDivider } from 'frontend';

export const DarkToLight = () => (
  <div style={{ background: '#082F49', height: '120px' }}>
    <WaveDivider topColor="#082F49" bottomColor="#ffffff" height={80} />
  </div>
);

export const LightToDark = () => (
  <div style={{ background: '#F8FBFF', height: '120px' }}>
    <WaveDivider topColor="#F8FBFF" bottomColor="#082F49" height={80} flip />
  </div>
);

export const PrimaryToWhite = () => (
  <div style={{ background: '#0369A1', height: '120px' }}>
    <WaveDivider topColor="#0369A1" bottomColor="#ffffff" height={72} />
  </div>
);
