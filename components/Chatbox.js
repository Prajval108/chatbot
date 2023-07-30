// Chatbox.js
import { useRef, useState } from 'react';
import { Input, Button, InputGroup, InputRightElement, Center, Box, Text, Tab, TabList, Tabs, Heading } from '@chakra-ui/react';
import { AttachmentIcon } from '@chakra-ui/icons'
import axios from 'axios';
import ChatMessage from './ChatMessage';

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadModelStatus, setLoanModel] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [docs, setDocs] = useState()
  const FormData = require('form-data');
  const fileInputRef = useRef(null);

  const [selectedTab, setSelectedTab] = useState("t5_large");

  const handleTabClick = (tabIndex) => {
    setSelectedTab(tabIndex);

  };


  const getAnswer = async () => {
    if (!inputText) return;
    setMessages((prevMessages) => [...prevMessages, { text: inputText, isUser: true }]);
    setInputText('');
    setIsLoading(true);
    let answer;
    try {
      const formData = new FormData();
      formData.append('question', inputText);
      // let answer;
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/t5_large/ask_question`, formData).then(async (res) => {
        if (res?.data?.errorCode == 0) {
          answer = res?.data?.data;
          console.log("dasta", answer)
        } else {
          answer = "something went wrong"
        }
      });
    } catch (error) {
      console.error('Error fetching the answer:', error);
      answer = "something went wrong"
    }
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: answer, isUser: false },
    ]);
    setIsLoading(false);
  };

  const loadModel = async (docs) => {
    setLoanModel(true);
    try {
      const formData = new FormData();
      formData.append('file_url', docs);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/t5_large/load_model_with_url`, formData).then(async (res) => {
        if (res?.data?.errorCode == 0) {
          console.log("dasta", res?.data)
        } else {
        }
      });
    } catch (error) {
      console.error('Error fetching the answer:', error);
    }
    setLoanModel(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      getAnswer();
    }
  };

  const uploadDocumentToS3 = async (event) => {
    setUploading(true);
    var data = new FormData();
    data.append("file", event.target.files[0]);
    data.append("filePath", "gpt-");
    data.append("fileName", event.target.files[0]?.name);
    // setIcon(event.target.files[0]?.name);
    var config = {
      method: "post",
      url: "https://documents.sapidblue.in/upload_file",
      headers: {
        ...(data.getHeaders
          ? data.getHeaders()
          : { "Content-Type": "multipart/form-data" }),
      },
      data: data,
    };
    axios(config)
      .then(function (response) {
        if (response?.data?.errorCode === 0) {
          console.log("s3Link", response?.data?.url)
          setDocs(response?.data?.url);
          setUploading(false);
          loadModel(response?.data?.url)
        } else {
          setDocs("");
          setUploading(false);
          window.alert(response?.data?.message);
        }
      })
      .catch(function (error) {
        console.log("error while uploading", error);
        setUploading(false);
      });
  };

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <div style={{ marginBottom: '1rem', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        <Heading as="h1" fontSize="25px" mb={4}>
          DocChat
        </Heading>
        <Center>
          <Tabs variant='soft-rounded' colorScheme='green' mb={4}>
            <TabList>
              <Tab onClick={() => handleTabClick("t5_large")}>t5 Large</Tab>
              <Tab isDisabled onClick={() => handleTabClick("LLaMA")}>LLaMA</Tab>
            </TabList>
          </Tabs>
        </Center>
        {messages.map((message, index) => (
          <ChatMessage key={index} text={message.text} isUser={message.isUser} />
        ))}
      </div>

      <div style={{ paddingBottom: '20px', width: '100%', position: 'sticky', bottom: 0 }}>
          <Center>
            <InputGroup size='md' width="1000px">
              <Input
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
              />

              <InputRightElement width='8.5rem' style={{ "cursor": "pointer" }}>
                <Box>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => uploadDocumentToS3(e)}
                  />

                  <Box as="span" onClick={handleIconClick}>
                    <AttachmentIcon mx="15px" boxSize={5} />
                  </Box>
                </Box>

                <Button
                  isLoading={isLoading || loadModelStatus}
                  size='sm'
                  borderRadius='20px'
                  onClick={getAnswer}
                >
                  <Text fontSize="17px">
                    Send
                  </Text>
                </Button>
              </InputRightElement>
            </InputGroup>
          </Center>
        </div>
    </>
  );
};

export default Chatbox;
