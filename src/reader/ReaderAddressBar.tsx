import { useEffect, useState } from 'react';

interface Props {
  currentUrl: string | undefined;
  onSubmitUrl: (url: string) => void;
}

export function ReaderAddressBar({ currentUrl, onSubmitUrl }: Props) {
  const [stateUrl, setStateUrl] = useState('');

  useEffect(() => {
    if (currentUrl === undefined) {
      return;
    }

    // Double render :(
    setStateUrl(currentUrl);
  }, [currentUrl]);

  return (
    <div>
      <span>Address</span>
      <input
        type="text"
        value={stateUrl}
        onChange={(e) => setStateUrl(e.target.value)}
      />
      <button onClick={() => onSubmitUrl(stateUrl)}>Go</button>
    </div>
  );
}
