import { FormEvent, useEffect, useState } from 'react';
import { safeUrl } from '../common/safe-url';

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

  return (
    <div className="address-bar">
      <form action="/" onSubmit={onSubmit}>
        <input
          className="address-input"
          type="text"
          value={stateUrl}
          onChange={(e) => setStateUrl(e.target.value)}
        />
        <button type="submit">Go</button>
      </form>
    </div>
  );
}
