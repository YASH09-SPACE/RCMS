import { useState, useEffect } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import GoogleMapViewer from '../../components/common/GoogleMapViewer';

const GujaratHeatmap = () => {
  return (
    <SuperAdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Gujarat State Heatmap
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Real-time visualization of all complaints across Gujarat state
        </p>
      </div>

      <GoogleMapViewer />
    </SuperAdminLayout>
  );
};

export default GujaratHeatmap;
