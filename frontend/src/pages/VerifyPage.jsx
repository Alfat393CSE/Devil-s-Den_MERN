import { Box, Text } from "@chakra-ui/react";

const VerifyPage = () => {
  return (
    <Box maxW="680px" mx="auto" mt={12} p={6} bg="white" rounded="md" shadow="sm">
      <Text fontSize="xl" fontWeight="bold" mb={3}>Email Verification</Text>
      <Text>
        Your account has been created. Please contact admin for verification. Admins can verify users manually in the database.
      </Text>
    </Box>
  );
};

export default VerifyPage;
