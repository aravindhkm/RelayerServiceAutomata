# RelayerServiceClient
RelayerServiceClient React app to Web3.

# How to use?
Wrap your **App** in `<MetamaskProvider></MetamaskProvider>`

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

