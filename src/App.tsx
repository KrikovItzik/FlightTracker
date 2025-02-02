import React, { useState, useEffect } from 'react';
import { Search, Plane, Filter } from 'lucide-react';
import { countryToCode } from './types';
import { PlaneTakeoff, PlaneLanding, Clock } from 'lucide-react';

interface FilterState {
  type: 'all' | 'arrival' | 'departure';
  status: string;
}

function App() {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    status: '',
  });

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://data.gov.il/api/3/action/datastore_search?resource_id=e83f763b-b7d7-479e-b172-ae981ddc6de5'
      );
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setFlights(data.result.records);
      } else {
        setError('Failed to fetch flight data');
      }
    } catch (err) {
      setError('Error fetching flight data');
    } finally {
      setLoading(false);
    }
  };



const getFlightStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'departed':
      return <PlaneTakeoff className="h-8 w-8 text-blue-500" />;
    case 'landed':
      return <PlaneLanding className="h-8 w-8 text-green-500" />;
    default:
      return <Clock className="h-8 w-8 text-gray-400" />; // Default icon for unknown status
  }
};

  useEffect(() => {
    fetchFlights();
  }, []);

  const filteredFlights = flights.filter((flight) => {
    const searchLower = searchTerm.toLowerCase();
    const flightNumber = String(flight.CHFLTN || '').toLowerCase();
    const flightOperator = String(flight.CHOPERD || '').toLowerCase();
    const city = String(flight.CHLOC1T || '').toLowerCase();
    const country = String(flight.CHLOCCT || '').toLowerCase();
    const terminal_code = String(flight.CHLOC1 || '').toLowerCase();
    const terminal_name = String(flight.CHLOC1D || '').toLowerCase();

    const matchesSearch = searchTerm === '' || 
      flightNumber.includes(searchLower) ||
      flightOperator.includes(searchLower) ||
      city.includes(searchLower) ||
      terminal_code.includes(searchLower) ||
      terminal_name.includes(searchLower) ||
      country.includes(searchLower);

    const matchesType = 
      filters.type === 'all' || 
      (filters.type === 'arrival' && flight.CHAORD === 'A') ||
      (filters.type === 'departure' && flight.CHAORD === 'D');

    const flightStatus = String(flight.CHRMINE || '').toLowerCase();
    const matchesStatus = 
      !filters.status || flightStatus === filters.status.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const getCountryFlag = (country: string) => {
    const code = countryToCode[country?.toUpperCase()];
    if (!code) return null;
    return `https://flagcdn.com/w20/${code}.png`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Krikov Flight Tracker</h1>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => fetchFlights()}
                className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg text-sm"
              >
                Refresh Data
              </button>
              <p className="text-sm text-gray-200">Total Flights: {filteredFlights.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search flights, cities, or countries..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-4">
              <select
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as FilterState['type'] }))}
              >
                <option value="all">All Flights</option>
                <option value="arrival">Arrivals</option>
                <option value="departure">Departures</option>
              </select>
              <select
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Statuses</option>
                <option value="canceled">Canceled</option>
                <option value="delayed">Delayed</option>
                <option value="landed">Landed</option>
                <option value="departed">Departed</option>
                <option value="not final">Not Final</option>
              </select>
            </div>
          </div>
        </div>

        {/* Flights Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading flights...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
<div className="bg-white rounded-lg shadow-md w-full">
  <div className="w-full">
    <table className="w-full table-fixed divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
            Flight No'
          </th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
            Flight Code
          </th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
            Flight Operator
          </th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
            Country
          </th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
            City
          </th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
            Terminal Code
          </th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
            Terminal
          </th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
            Scheduled
          </th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
            Actual
          </th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredFlights.map((flight) => (
          <tr key={flight._id} className="hover:bg-gray-50">
            <td className="px-2 py-4 whitespace-normal text-sm font-medium text-gray-900">
              {flight.CHFLTN || '-'}
            </td>
            <td className="px-2 py-4 whitespace-normal text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span>{flight.CHOPER || '-'}</span>
                <img 
                  src={`https://www.gstatic.com/flights/airline_logos/70px//${flight.CHOPER}.png`} 
                  alt="Airline Logo" 
                  className="w-8 h-8 object-cover" 
                />
              </div>
            </td>
            <td className="px-2 py-4 whitespace-normal text-sm text-gray-500">
              {flight.CHOPERD || '-'}
            </td>
            <td className="px-2 py-4 whitespace-normal text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                {getCountryFlag(flight.CHLOCCT) && (
                  <img src={getCountryFlag(flight.CHLOCCT)} alt={`${flight.CHLOCCT} flag`} className="w-6 h-4 object-cover"/>
                )}
                <span>{flight.CHLOCCT || '-'}</span>
              </div>
            </td>
            <td className="px-2 py-4 whitespace-normal text-sm text-gray-500">
              {flight.CHLOC1T || '-'}
            </td>
            <td className="px-2 py-4 whitespace-normal text-sm text-gray-500">
              {flight.CHLOC1 || '-'}
            </td>
            <td className="px-2 py-4 whitespace-normal text-sm text-gray-500">
              {flight.CHLOC1D || '-'}
            </td>
            <td className="px-2 py-4 whitespace-normal text-sm text-gray-500">
              {flight.CHSTOL || '-'}
            </td>
            <td className="px-2 py-4 whitespace-normal text-sm text-gray-500">
              {flight.CHPTOL || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {getFlightStatusIcon(flight.CHRMINE)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
 )}
      </div>
    </div>
  );
}

export default App;