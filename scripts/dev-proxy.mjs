import { EnvHttpProxyAgent, setGlobalDispatcher } from 'undici';

const proxyUrl = 'http://127.0.0.1:12334';

setGlobalDispatcher(new EnvHttpProxyAgent({
    httpProxy: proxyUrl,
    httpsProxy: proxyUrl,
    noProxy: 'localhost,127.0.0.1,::1',
}));
