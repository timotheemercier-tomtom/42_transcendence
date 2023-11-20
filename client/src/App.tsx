import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spacer,
  Text,
} from "@chakra-ui/react";

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

        {/* Radio Buttons */}
        <FormControl as="fieldset">
          <FormLabel as="legend">Radio Group</FormLabel>
          <RadioGroup defaultValue="1">
            <HStack spacing="24px">
              <Radio value="1">Option 1</Radio>
              <Radio value="2">Option 2</Radio>
              <Radio value="3">Option 3</Radio>
            </HStack>
          </RadioGroup>
        </FormControl>

        {/* Slider */}
        <FormControl id="slider">
          <FormLabel>Slider</FormLabel>
          <Slider defaultValue={30} min={0} max={100}>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </FormControl>

        {/* Range Slider */}
        <FormControl id="range-slider">
          <FormLabel>Range Slider</FormLabel>
          <RangeSlider defaultValue={[10, 30]} min={0} max={100}>
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
        </FormControl>

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
