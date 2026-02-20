import './App.css';
import { RouteConfig } from './routes/RouteConfig';
import { RecoilRoot } from 'recoil';

function App() {
  return (
    <RecoilRoot>
      <RouteConfig />
    </RecoilRoot>
  );
}

export default App;
