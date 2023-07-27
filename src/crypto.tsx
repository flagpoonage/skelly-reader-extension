import { renderElement } from './page-renderer';
import './crypto/crypto.css';
import {
  exportJsonWebKey,
  generateSigningKeyPair,
} from './common/crypto-utils';
import { useLayoutEffect, useRef, useState } from 'react';
import { Signature, SignedPayload } from './signature';

const keyCount = (function* keyCounter() {
  let i = 1;
  while (i < 10000000) {
    yield i;
    i++;
  }

  return null;
})();

function CryptoPage() {
  const logRef = useRef<HTMLTextAreaElement | null>(null);
  const [privKey, setPrivKey] = useState('');
  const [pubKey, setPubKey] = useState('');
  const [currentLog, setLog] = useState('This is the logs');
  const [identity, setIdentity] = useState('');
  const [domain, setDomain] = useState('');
  const [signature, setSignature] = useState<SignedPayload | null>(null);

  const onGenerate = async () => {
    updateLog('Generating new keys...');
    const keys = await generateSigningKeyPair(true);

    if (!keys.success) {
      updateLog('Unable to generate new keys', keys.error.message);
      return;
    }

    const priv_key = await exportJsonWebKey(keys.value.privateKey);
    const pub_key = await exportJsonWebKey(keys.value.publicKey);

    if (!priv_key.success) {
      updateLog('Unable to export private key', priv_key.error.message);
    } else {
      updateLog('Private key exported.');
      setPrivKey(JSON.stringify(priv_key.value));
    }
    if (!pub_key.success) {
      updateLog('Unable to export public key', pub_key.error.message);
    } else {
      updateLog('Public key exported.');
      setPubKey(JSON.stringify(pub_key.value));
    }

    updateLog('Key generation finished.');
  };

  const onSign = async () => {
    if (!privKey) {
      updateLog('Cannot sign without generating a keypair first');
      return;
    }

    if (!identity || !domain) {
      updateLog('Cannot sign without entering an identity and a domain first');
      return;
    }

    updateLog('Creating signature...');

    const result = await Signature.signIdentity(
      identity,
      domain,
      privKey,
      false,
    );

    if (!result.success) {
      updateLog('Unable to create signature', result.error.message);
      return;
    }

    updateLog('Signature Created');
    setSignature(result.value);
  };

  function updateLog(...strs: string[]) {
    setLog(
      (v) =>
        strs.map((a) => `[${keyCount.next().value}]: ${a}`).join('\n') +
        '\n' +
        v,
    );
  }

  useLayoutEffect(() => {
    setTimeout(() => {
      if (!logRef.current) {
        return;
      }
      logRef.current.scrollTop = 0;
    });
  }, [currentLog]);

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <table>
          <tbody>
            <tr>
              <td>Regenerate</td>
              <td>
                <button onClick={onGenerate}>Generate New Key Pair</button>
              </td>
            </tr>
            <tr>
              <td>Public Key</td>
              <td>
                <textarea value={pubKey}></textarea>
              </td>
            </tr>
            <tr>
              <td>Private Key</td>
              <td>
                <textarea value={privKey}></textarea>
              </td>
            </tr>
            <tr>
              <td>Identity</td>
              <td>
                <input
                  type="text"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>Domain</td>
              <td>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <textarea ref={logRef} value={currentLog}></textarea>
        <table>
          <tbody>
            <tr>
              <td>Create Signature</td>
              <td>
                <button onClick={onSign}>Create Signature</button>
              </td>
            </tr>
            <tr>
              <td>Phrase</td>
              <td>
                <input type="text" value={signature?.phrase ?? ''} />
              </td>
            </tr>
            <tr>
              <td>Signature</td>
              <td>
                <input type="text" value={signature?.signature.base64 ?? ''} />
              </td>
            </tr>
            <tr>
              <td>Expected Header</td>
              <td>
                <textarea
                  value={
                    signature
                      ? `Authorization: Skelly ${signature.phrase} ${signature.signature.base64}`
                      : ''
                  }
                ></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

renderElement(<CryptoPage />);
