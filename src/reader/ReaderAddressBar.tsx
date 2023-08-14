import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { safeUrl } from '../common/safe-url';

interface Props {
  currentUrl: string | undefined;
  onSubmitUrl: (url: string) => void;
}

export function ReaderAddressBar({currentUrl, onSubmitUrl}: Props) {
  const [stateUrl, setStateUrl] = useState('');

  useEffect(() => {
    if (currentUrl === undefined) {
      return;
    }

    // Double render :(
    setStateUrl(currentUrl);
  }, [currentUrl]);

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    const url_result = safeUrl(stateUrl);

    if (url_result.success) {
      return onSubmitUrl(stateUrl);
    }

    const with_protocol = `https://${stateUrl}`;
    const protocol_result = safeUrl(with_protocol);

    if (protocol_result.success) {
      return onSubmitUrl(with_protocol);
    }

    // TODO: Theres a lot more we can do here to figure out what the user wants, but this covers
    // the basics for now.
    setStateUrl(currentUrl ?? '');
  }

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => setStateUrl(e.target.value)

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' ? setStateUrl(e.currentTarget.value) : null

  return (
    <form action="/" onSubmit={onSubmit} className='w-full'>
      <label htmlFor="default-search"
             className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
               xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>

        <input
          type="search"
          id="default-search"
          className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search Mockups, Logos..."
          required
          value={stateUrl}
          onKeyUp={handleKeyUp}
          onChange={handleOnChange}
        />
        <button type="submit"
                className="text-white absolute right-2 top-1.5 bottom-1.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Go
        </button>
      </div>
    </form>
  );
}
