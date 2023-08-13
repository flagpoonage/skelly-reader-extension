import { ReaderAddressBar } from './ReaderAddressBar';
import { ReaderFilters } from "./ReaderFilters";
import { useState } from "react";

interface Props {
  currentUrl: string | undefined;
  onSubmitUrl: (url: string) => void;
}

export function ReaderControls({currentUrl, onSubmitUrl}: Props) {
  const [showFilters, setShowFilters] = useState(false)

  const handleToggleFilters = () => setShowFilters(!showFilters)

  return (
    <div className="flex items-center h-16 px-2 dark:bg-[#333] bg-white">
      <div className='mr-4 relative'>
        <svg
          onClick={handleToggleFilters}
          className="w-4 h-4 cursor-pointer text-gray-800 dark:text-white" aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M1 5h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 1 0 0-2H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2Zm18 4h-1.424a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2h10.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Zm0 6H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 0 0 0 2h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Z"/>
        </svg>
        {showFilters && (
          <>
            <div className='absolute top-8 bg-white px-2 py-4 rounded w-60 z-[2]'>
              <ReaderFilters/>
            </div>
            <div className='fixed top-0 left-0 w-full h-full z-[1]' onClick={() => setShowFilters(false)}></div>
          </>
        )}
      </div>
      <ReaderAddressBar currentUrl={currentUrl} onSubmitUrl={onSubmitUrl}/>
    </div>
  );
}
