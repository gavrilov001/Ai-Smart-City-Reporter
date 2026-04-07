'use client';

import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';

interface Report {
  id: string;
  title: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  created_at: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

// North Macedonia center coordinates
const defaultCenter = {
  lat: 41.6086,
  lng: 21.7453,
};

export default function ReportsMap() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports');
      if (response.data.status === 'success' && response.data.data) {
        // Filter reports that have coordinates
        const reportsWithCoords = response.data.data.filter(
          (report: Report) => report.latitude && report.longitude
        );
        setReports(reportsWithCoords);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return '#3B82F6'; // blue
      case 'pending':
        return '#FBBF24'; // amber
      case 'in_progress':
        return '#F97316'; // orange
      case 'resolved':
        return '#10B981'; // green
      case 'rejected':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  const getMarkerIcon = (status: string) => {
    const color = getStatusColor(status);
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#fff',
      strokeWeight: 2,
    };
  };

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Google Maps API Key Missing</p>
          <p className="text-gray-600 text-sm">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
        {[
          { status: 'new', label: 'New', color: '#3B82F6' },
          { status: 'pending', label: 'Pending', color: '#FBBF24' },
          { status: 'in_progress', label: 'In Progress', color: '#F97316' },
          { status: 'resolved', label: 'Resolved', color: '#10B981' },
          { status: 'rejected', label: 'Rejected', color: '#EF4444' },
        ].map(({ status, label, color }) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-sm text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={7}
          onLoad={setMap}
          options={{
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
            streetViewControl: false,
          }}
        >
          {reports.map((report) => (
            <Marker
              key={report.id}
              position={{
                lat: report.latitude || 0,
                lng: report.longitude || 0,
              }}
              icon={getMarkerIcon(report.status)}
              onClick={() => setSelectedMarker(report.id)}
              title={report.title}
            >
              {selectedMarker === report.id && (
                <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                  <div className="w-64">
                    <h3 className="font-bold text-gray-900 mb-1">{report.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{report.address}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="px-2 py-1 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: getStatusColor(report.status) }}
                      >
                        {report.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <a
                      href={`/report/${report.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                    >
                      View Details →
                    </a>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </LoadScript>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-600 text-sm font-semibold">Total Issues</p>
          <p className="text-2xl font-bold text-blue-900">{reports.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-600 text-sm font-semibold">Resolved</p>
          <p className="text-2xl font-bold text-green-900">
            {reports.filter((r) => r.status === 'resolved').length}
          </p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-orange-600 text-sm font-semibold">In Progress</p>
          <p className="text-2xl font-bold text-orange-900">
            {reports.filter((r) => r.status === 'in_progress').length}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Pending</p>
          <p className="text-2xl font-bold text-gray-900">
            {reports.filter((r) => r.status === 'pending' || r.status === 'new').length}
          </p>
        </div>
      </div>
    </div>
  );
}
