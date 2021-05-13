import React,{useState} from 'react';
import {ChakraProvider} from '@chakra-ui/react'
import HomePage from "./WebPage/HomePage";







function App() {



  
  return (
    <ChakraProvider>
     <HomePage/>
    </ChakraProvider>
   
  );
}

export default App;
