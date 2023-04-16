import { MetamaskProvider } from "./metamask/context";
import HelloMetamask from "./components/HelloMetamask";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';


export default function App() {
  return (
    <MetamaskProvider>
      <HelloMetamask />
    </MetamaskProvider>
  );
}
