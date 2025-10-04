import React, { useState, useEffect } from 'react';
import { Search, Plane, Filter } from 'lucide-react';
import { countryToCode } from './types'; // Assuming this correctly maps country names to codes
import { PlaneTakeoff, PlaneLanding, Clock } from 'lucide-react';

// Assuming FlightData and ApiResponse types are defined in types.ts or similarly
interface FlightData {
  CHFLTN: string; // Flight Number
  CHOPER: string; // Flight Code
  CHOPERD: string; // Flight Operator Description
  CHLOC1T: string; // City
  CHLOCCT: string; // Country
  CHLOC1: string; // Terminal Code
  CHLOC1D: string; // Terminal Name
  CHAORD: 'A' | 'D'; // Arrival or Departure
  CHRMINE: string; // Status description
  CHSTOL: string; // Scheduled Time of Landing/Takeoff (e.g., "2025-10-04T12:00:00")
  CHPTOL: string; // Actual Event Time (e.g., "2025-10-04T12:15:00")
  // ... other properties you might have
}

interface ApiResponse {
  success: boolean;
  result: {
    records: FlightData[];
  };
}

interface FilterState {
  type: 'all' | 'arrival' | 'departure';
  status: string;
}

function App() {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllData, setShowAllData] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
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
        console.log("Fetched flight data:", data.result.records); 
        console.log("Total flights loaded:", data.result.records.length);
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

  useEffect(() => {
    console.log('Search term changed to:', searchTerm);
    console.log('Total flights loaded:', flights.length);
  }, [searchTerm, flights.length]);

  const filteredFlights = React.useMemo(() => {
    return flights.filter((flight) => {
    const searchLower = searchTerm.toLowerCase();
    const flightNumber = String(flight.CHFLTN || '').toLowerCase();
    const flightCode = String(flight.CHOPER || '').toLowerCase();
    const flightOperator = String(flight.CHOPERD || '').toLowerCase();
    const city = String(flight.CHLOC1T || '').toLowerCase();
    const country = String(flight.CHLOCCT || '').toLowerCase();
    const terminal_code = String(flight.CHLOC1 || '').toLowerCase();
    const terminal_name = String(flight.CHLOC1D || '').toLowerCase();

    const matchesSearch = searchTerm === '' ||
      flightNumber.includes(searchLower) ||
      flightCode.includes(searchLower) ||
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

    // Date filtering based on checkbox
    let isFutureFlight = true;
    if (!showAllData) {
      // Show only next 10 days
      const today = new Date();
      const tenDaysFromNow = new Date();
      tenDaysFromNow.setDate(today.getDate() + 10);
      
      const flightDate = new Date(flight.CHSTOL);
      isFutureFlight = !isNaN(flightDate.getTime()) && 
                      flightDate >= today && 
                      flightDate <= tenDaysFromNow;
    }

    // Debug logging for search
    if (searchTerm && searchTerm.length > 0 && flights.indexOf(flight) === 0) {
      console.log('Search debug:', {
        searchTerm: searchTerm,
        searchLower: searchLower,
        matchesSearch: matchesSearch,
        flightNumber: flightNumber,
        flightCode: flightCode,
        flightOperator: flightOperator,
        city: city,
        country: country
      });
    }

    return matchesSearch && matchesType && matchesStatus && isFutureFlight;
    });
  }, [flights, searchTerm, filters.type, filters.status, showAllData]);

  // Debug: log filtering results
  console.log('Filtering results:', {
    totalFlights: flights.length,
    filteredFlights: filteredFlights.length,
    searchTerm,
    filters
  });

  // Track filtered flights changes
  useEffect(() => {
    console.log('Filtered flights updated:', filteredFlights.length);
  }, [filteredFlights]);

  const getCountryFlag = (country: string) => {
    const code = countryToCode[country?.toUpperCase()];
    if (!code) return null;
    return `https://flagcdn.com/w20/${code}.png`;
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'N/A';
    
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      // Format: "Oct 4, 18:15"
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  function getAirlineLogo(choper: string): string {
    // 'https://www.gstatic.com/flights/airline_logos/70px//A4.png' General
    switch (choper) {
      case 'LIL':
        return 'https://www.flylili.com/assets/img/fb_logo.jpg';
      case 'H4':
      case 'H7':
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAZlBMVEVHcEwVOmAaPV/4mSPThyv4mSOWakv4mSP4mSN5XD/9nh8TPmcTPmcSPmcTPmf4mSP4mSP4mSOcbjYTPmf4mSMTPmcTPmcTPmf4mSP4mSP4mSMTPmcTPmcTPmf4mSMTPmcQPWcTPmfCHNupAAAAInRSTlMAEjQXWQ4GeWdxLkWQf9b/R/CI/7hY4nDS4aC7KvORH6TH8hnwgwAAALJJREFUeAHlzceBxCAQBMCWNwiavZb3yj/J47c+gi2Y+YzDj4niCB8kaZYXJVDVMI01sO6hjcw8b0j/0CiA9DBIomSLuobUIYrUY+giazAM8BzTiYXnDKmPYbQ4rZ2aSBsK7iPpd5Ywm3QMCilc6EIXZpZlONuyzoFe5pTWA5cOK4uRPidxI04FcIoXF7KTOoxjXk8twrf95gwuh8HlZrs2rfgsR6cNnxlJXwdX158RfsY/BU8MuvYYNu8AAAAASUVORK5CYII=';
      case 'OE':
        return 'https://seatmaps.com/assets/logo/logo-5F.png';
      case 'A4':
        return 'https://flydoha.qa/img_airlines/A4.png';
      case '3E':
        return 'https://www.electra-airways.com/wp-content/themes/electra/img/icons/large_electra2.jpg';
      default:
        return `https://www.gstatic.com/flights/airline_logos/70px//${choper}.png`;
    }
  }

  // Mobile Flight Card Component
  const FlightCard = ({ flight }: { flight: FlightData }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
      {/* Flight Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={getAirlineLogo(flight.CHOPER || '')}
            alt="Airline Logo"
            className="w-10 h-10 object-cover rounded"
          />
          <div>
            <div className="font-bold text-lg text-gray-900">{flight.CHFLTN}</div>
            <div className="text-sm text-gray-500">{flight.CHOPER || '-'}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getFlightStatusIcon(flight.CHRMINE || 'unknown')}
        </div>
      </div>

      {/* Flight Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Operator:</span>
          <span className="text-sm text-gray-900">{flight.CHOPERD || '-'}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Destination:</span>
          <div className="flex items-center space-x-1">
            {getCountryFlag(flight.CHLOCCT) && (
              <img src={getCountryFlag(flight.CHLOCCT) as string} alt={`${flight.CHLOCCT} flag`} className="w-4 h-3 object-cover" />
            )}
            <span className="text-sm text-gray-900">{flight.CHLOC1T}, {flight.CHLOCCT}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Terminal:</span>
          <span className="text-sm text-gray-900">{flight.CHLOC1} - {flight.CHLOC1D}</span>
        </div>

        {/* Timing */}
        <div className="border-t pt-2 mt-2">
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Scheduled:</span>
              <span className="text-sm text-gray-900">{formatDateTime(flight.CHSTOL)}</span>
            </div>
            {flight.CHPTOL && flight.CHPTOL !== '' && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Actual:</span>
                <span className="text-sm font-semibold text-blue-700">{formatDateTime(flight.CHPTOL)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

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
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchFlights()}
                  className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg text-sm"
                >
                  Refresh Data
                </button>
                <button
                  onClick={() => setIsMobileView(!isMobileView)}
                  className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg text-sm md:hidden"
                  title="Toggle view"
                >
                  {isMobileView ? 'Table' : 'Cards'}
                </button>
              </div>
              <p className="text-sm text-gray-200">
                Showing: {filteredFlights.length} / {flights.length} flights
                {searchTerm && ` (searching: "${searchTerm}")`}
              </p>
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
          
          {/* Date Range Option */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllData}
                onChange={(e) => setShowAllData(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Load all flight data (unchecked = next 10 days only)
              </span>
            </label>
          </div>
        </div>

        {/* Flights Display - Responsive */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading flights...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-x-auto">
              <table key={`table-${searchTerm}-${filteredFlights.length}`} className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Flight No'
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Flight Code
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Flight Operator
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Terminal Code
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Terminal
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timing
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFlights.map((flight, index) => (
                    <tr key={`${flight.CHFLTN}-${index}-${searchTerm}`} className="hover:bg-gray-100">
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {flight.CHFLTN}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {flight.CHOPER || '-'}
                      </td>
                      <td className="px-2 py-4 whitespace-normal text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <img
                            src={getAirlineLogo(flight.CHOPER || '')}
                            alt="Airline Logo"
                            className="w-8 h-8 object-cover"
                          />
                          <span>{flight.CHOPERD || '-'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {getCountryFlag(flight.CHLOCCT) && (
                            <img src={getCountryFlag(flight.CHLOCCT) as string} alt={`${flight.CHLOCCT} flag`} className="w-6 h-4 object-cover border border-gray-800" />
                          )}
                          <span className="ml-1">{flight.CHLOCCT}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {flight.CHLOC1T}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {flight.CHLOC1}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {flight.CHLOC1D}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span>ST: {formatDateTime(flight.CHSTOL)}</span>
                          {flight.CHPTOL && flight.CHPTOL !== '' && (
                            <span className="font-semibold text-blue-700">AT: {formatDateTime(flight.CHPTOL)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          {getFlightStatusIcon(flight.CHRMINE || 'unknown')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Visible on mobile */}
            <div className="md:hidden">
              {filteredFlights.map((flight, index) => (
                <FlightCard key={`${flight.CHFLTN}-${index}-mobile`} flight={flight} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
