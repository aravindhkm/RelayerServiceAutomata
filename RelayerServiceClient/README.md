# RelayerServiceClient
RelayerServiceClient React app to Web3.

**App.jsx**
```
import { MetamaskProvider } from ". /metamask";
import HelloMetamask from "./components/HelloMetamask";

export default function App() {
  return (
    <MetamaskProvider>
      <HelloMetamask />
    </MetamaskProvider>
  );
}
```

