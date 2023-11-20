import { Box, Button, Flex, Spacer, Text } from "@chakra-ui/react";
import "./App.css";
import Chat from "./Chat";

function App() {
  return (
    <div className="App">
      <Flex direction="column" minHeight="100vh">
        {/* Navigation Bar */}
        <Box bg="teal.500" w="100%" p={4} color="white">
          <Text fontSize="xl">My Chakra App</Text>
        </Box>

        {/* Main Content */}
        <Flex direction="column" flex="1" justify="center" align="center">
          <Text fontSize="3xl" mb="2">
            Welcome to the Chakra UI Example
          </Text>
          <Button colorScheme="teal" size="lg">
            Click Me
          </Button>
        </Flex>

        <Chat></Chat>

        {/* Footer */}
        <Box bg="teal.600" w="100%" p={4} color="white">
          <Flex justify="center">
            <Text>Footer Content</Text>
            <Spacer />
            <Text>More Content</Text>
          </Flex>
        </Box>
      </Flex>
    </div>
  );
}

export default App;
