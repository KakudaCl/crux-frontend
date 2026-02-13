import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { RouteConfig } from './components/RouteConfig';
import { RecoilRoot } from 'recoil';

function App() {

  return (
    <RecoilRoot>
      <RouteConfig />
    </RecoilRoot>
  )
}

export default App
