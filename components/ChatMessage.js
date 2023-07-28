// ChatMessage.js
import { Box, Center } from '@chakra-ui/react';

const ChatMessage = ({ text, isUser }) => {
  return (
    <Center>
    <Box width="1000px" borderRadius="10px" py={3} px={5} bg={isUser ? 'teal.500' : 'gray.100'} color={isUser ? 'white' : 'black'} my={1}>
      {text}
    </Box>
    </Center>
  );
};

export default ChatMessage;
