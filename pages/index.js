// ChatbotPage.js
import { VStack } from '@chakra-ui/react';
import Chatbox from '../components/Chatbox';
import { ChakraProvider } from '@chakra-ui/react'


const ChatbotPage = () => {

  return (
    <ChakraProvider>
      <VStack p={4} spacing={8} align="stretch">
        <Chatbox />
      </VStack>
    </ChakraProvider>

  );
};

export default ChatbotPage;
