import React, { useState } from 'react';
import { Box, Button, Center, ChakraProvider, Heading, Progress, Radio, RadioGroup, Stack, Tab, TabList, Tabs, Text, VStack } from '@chakra-ui/react';
import ApiResponseTable from '../components/Table';
import axios from 'axios';


const FileUploadPage = () => {
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState()
    const [uploading, setUploading] = useState(false)
    const [docs, setDocs] = useState()
    const [selectedTab, setSelectedTab] = useState("openai");
    const [documentType, setDocumentType] = useState('rent-agreement')


    const getModelWiseEndpoint = () => {
        if (selectedTab == "openai") {
            return "openai"
        } else {
            return "t5_large"
        }
    }


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



    const loadModel = async (url) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file_url', url);
            formData.append("document", documentType)
            // Start updating progress even before making the API call
            const interval = 500; // 0.5 seconds interval for progress update
            let currentProgress = 0;
            const progressStep = 100 / (400 / (interval / 1000)); // Assuming apiDelay is always 4 minutes (4 * 60 = 240 seconds)

            const updateProgress = () => {
                currentProgress += progressStep;
                setProgress(currentProgress);

                if (currentProgress >= 100) {
                    setProgress(0);
                } else {
                    setTimeout(updateProgress, interval);
                }
            };

            updateProgress(); // Call updateProgress initially
            const endPoint = getModelWiseEndpoint()
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/${endPoint}/`, formData);

            if (res?.data?.errorCode === 0) {
                setResponse(res?.data?.data);
                console.log("data", res);
                currentProgress = 100; // Set currentProgress to 100 when the API responds successfully
            }

        } catch (error) {
            console.error('Error fetching the answer:', error);
        } finally {
            setLoading(false);
        }
    };



    const handleTabClick = (tabIndex) => {
        setSelectedTab(tabIndex);
    };


    return (
        <ChakraProvider>
            <VStack p={4} spacing={8} align="stretch">
                <div style={{ marginBottom: '1rem', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                    <Heading as="h1" fontSize="25px" mb={4}>
                        DocAnalzer
                    </Heading>
                    <Center>
                        <VStack>
                            <Tabs variant='soft-rounded' colorScheme='green' mb={4}>
                                <TabList>
                                    <Tab onClick={() => handleTabClick("openai")}>OpenAI</Tab>
                                    <Tab onClick={() => handleTabClick("t5_large")}>t5 Large</Tab>
                                </TabList>
                            </Tabs>


                            <RadioGroup onChange={setDocumentType} value={documentType}>
                                <Stack direction='column'>
                                    <Radio disabled={loading} value='rent-agreement'>Rent Agreement</Radio>
                                    <Radio disabled={loading} value='invoice'>Invoice</Radio>
                                </Stack>
                            </RadioGroup>
                        </VStack>
                    </Center>

                </div>
                <Center>
                    <Box width="1000px">
                        <VStack spacing={4}>
                            <label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    style={{ display: 'none' }}
                                    onChange={uploadDocumentToS3}
                                    disabled={loading}
                                />
                                <Button
                                    as="span"
                                    size="lg"
                                    colorScheme="teal"
                                    variant="outline"
                                    px={8}
                                    py={70}
                                    cursor="pointer"
                                    borderRadius="20px"
                                    border="2px dashed teal"
                                    _hover={{ backgroundColor: 'teal.50' }}
                                    _active={{ backgroundColor: 'teal.100' }}
                                >
                                    <Text color="gray.400" style={{ "width": "190px", "whiteSpace": "normal" }} textAlign="center">
                                        {loading ? 'Processing...' : 'Drop your documents here or Click Here To Upload'}
                                    </Text>
                                </Button>
                            </label>
                            {(loading &&
                                <Progress
                                    value={progress}
                                    size="lg"
                                    w="100%"
                                    colorScheme="teal"
                                    borderRadius="full"
                                />
                            )}
                            {response && <ApiResponseTable data={response} />}

                        </VStack>
                    </Box>
                </Center>
            </VStack>
        </ChakraProvider>

    );
};

export default FileUploadPage;
