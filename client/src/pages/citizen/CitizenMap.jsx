import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Map as MapIcon } from 'lucide-react';
import CitizenLayout from '../../components/CitizenLayout';
import GoogleMapViewer from '../../components/common/GoogleMapViewer';

const CitizenMap = () => {
  return (
    <CitizenLayout>
      <div className="citizen-content">
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Home</Link>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Map View</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapIcon size={24} color="var(--primary)" /> Interactive Issue Map
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
                Visualizing all reported public infrastructure issues across the region.
              </p>
            </div>
            
            <Link to="/" className="home-show-all-btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <ArrowLeft size={16} /> Back to List
            </Link>
          </div>
        </div>

        {/* Map Container - Full screen height minus header */}
        <div style={{ 
          height: 'calc(100vh - 250px)', 
          minHeight: '600px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
        }}>
          <GoogleMapViewer />
        </div>
      </div>
    </CitizenLayout>
  );
};

export default CitizenMap;
