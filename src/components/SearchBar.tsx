import React from 'react';
import { Search, MapPin } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-500/30 transition-all duration-300 rounded-full" />
        <div className="relative flex items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-3 shadow-2xl">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activities or locations..."
            className="bg-transparent border-none outline-none text-white placeholder:text-gray-500 w-full text-sm"
          />
          <div className="h-4 w-[1px] bg-white/10 mx-3" />
          <MapPin 
            onClick={() => onSearch(query)}
            className="w-5 h-5 text-blue-500 cursor-pointer hover:scale-110 transition-transform" 
          />
        </div>
      </form>
    </div>
  );
};
