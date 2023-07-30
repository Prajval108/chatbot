import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Box } from '@chakra-ui/react';

const ApiResponseTable = ({ data }) => {
    if (!data) {
        return <div>No data to display.</div>;
    }

    const flattenData = (obj, parentKey = '') => {
        const flattened = {};
        for (const [key, value] of Object.entries(obj)) {
            const newKey = parentKey ? `${parentKey}.${key}` : key;
            if (typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(flattened, flattenData(value, newKey));
            } else {
                flattened[newKey] = value;
            }
        }
        return flattened;
    };

    const flattenedData = flattenData(data);

    return (
        <Box p={4} mt="50px" boxShadow="lg" rounded="lg">
            <Table variant="striped" colorScheme="teal">
                <Thead>
                    <Tr>
                        <Th>Key</Th>
                        <Th>Vaule</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {Object.entries(flattenedData).map(([key, value]) => (
                        <Tr key={key}>
                            <Td>{key}</Td>
                            <Td>{typeof value === 'object' ? JSON.stringify(value) : value}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default ApiResponseTable;
