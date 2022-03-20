import {
  Box,
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  SimpleGrid,
  VStack,
  Text,
  Stack,
  HStack,
} from "@chakra-ui/react";

import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import Webcam from "react-webcam";
import { FaTimes } from "react-icons/fa";

export default function Home() {
  // TODO:
  // [x] Make the capture button appear slowly
  // [x] Able to show toast if no camera

  const [selfPhoto, setSelfPhoto] = useState("");
  const [selectedSelfPhoto, setSelectedSelfPhoto] = useState("");
  const [selfMode, setSelfMode] = useState(false);
  const [dataFound, setDataFound] = useState(false);
  const [disableUntilWebcam, setDisableUntilWebcam] = useState(true);

  // WEBCAM OPEN

  function detectWebcam(callback) {
    let md = navigator.mediaDevices;
    if (!md || !md.enumerateDevices) return callback(false);
    md.enumerateDevices().then((devices) => {
      callback(devices.some((device) => "videoinput" === device.kind));
    });
  }

  const webcamRef = useRef(null);

  const [show, setShow] = React.useState(false);
  const [userMedia, setUserMedia] = React.useState(false);

  // const handleShow = React.useCallback(() => setShow(true), [setShow]);

  const handleClose = React.useCallback(() => {
    setShow(false);
    setUserMedia(false);
  }, [setShow, setUserMedia]);

  const handleOnUserMedia = React.useCallback(
    () => setUserMedia(true),
    [setUserMedia]
  );

  const videoConstraints = {
    width: 410,
    height: 250,
    facingMode: "user",
  };
  const capture = useCallback((e) => {
    const imageSrc = webcamRef.current.getScreenshot();
    setSelectedSelfPhoto(imageSrc);
  });
  // WEBCAM CLOSE

  // MODAL OPEN
  const { isOpen, onOpen, onClose } = useDisclosure();

  // USEEFFECT
  useEffect(() => {
    setDisableUntilWebcam(true);
  }, [selectedSelfPhoto]);
  useEffect(() => {
    if (!isOpen) {
      console.log("hello");
      setDisableUntilWebcam(true);
    }
  }, [isOpen]);

  return (
    <Box
      bg={"white"}
      py={{ base: "3", md: "4" }}
      boxShadow='md'
      borderRadius='sm'
      px={{ base: "3", md: "10" }}
    >
      <VStack spacing={6} alignItems={"left"}>
        <Text
          color={"#414143"}
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight='bold'
        >
          Driving License Verification
        </Text>
        <Text
          color={"#718096"}
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight='light'
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
          scelerisque nisl at ligula finibus, varius gravida augue cursus. Donec
          nec pulvinar dolor. In scelerisque placerat porttitor. Nulla finibus
          condimentum dui a tristique. Etiam sit amet venenatis nisi. Donec
          dapibus dignissim purus a tempus. Fusce lobortis turpis sed hendrerit
          consectetur. Integer in mattis tellus. Sed blandit malesuada eros, ac
          vulputate ex lacinia in. Class aptent taciti sociosqu ad litora
          torquent per conubia nostra, per inceptos himenaeos. Praesent luctus
          tincidunt aliquet. Vivamus non orci eu quam rhoncus rhoncus.
        </Text>
      </VStack>
      <Stack spacing={10} mt={10} direction={["column-reverse", null, "row"]}>
        <VStack
          spacing={6}
          color='white'
          w={{ base: "full", md: "full", lg: "full", xl: "1/2" }}
        >
          <Box
            bg={"gray.200"}
            color={"gray.500"}
            h={"32"}
            w={"32"}
            rounded={"full"}
          ></Box>
          <Text
            color={"#718096"}
            fontSize={{ base: "xs", md: "sm" }}
            fontWeight='light'
          >
            Upload photos of at least 1500 pixels (on the longest edge). And
            keep the file's size no larger than 1 MB.
          </Text>
          <HStack
            spacing={"4"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Button
              w={{ base: "150px", md: "180px" }}
              fontSize={{ base: "sm", md: "md" }}
              colorScheme='blue'
              variant='outline'
              onClick={() => {
                detectWebcam(function (hasWebcam) {
                  if (hasWebcam) {
                    onOpen();
                    setTimeout(() => {
                      setDisableUntilWebcam(false);
                    }, 3000);
                  } else {
                    onClose();
                    toast({
                      title: "Camera missing!",
                      status: "error",
                      duration: 4000,
                      isClosable: true,
                    });
                  }
                });
              }}
            >
              Take a Selfie
            </Button>
          </HStack>
        </VStack>
      </Stack>

      <SimpleGrid columns={{ base: 3, md: 3 }} spacing={2}>
        {selfMode && (
          <Box position='relative' className='add-photo' boxShadow='lg'>
            {!dataFound && (
              <Flex className='icon-delete'>
                <FaTimes
                  onClick={() => (
                    setSelectedSelfPhoto(""),
                    setSelfMode(false),
                    setSelfPhoto("")
                  )}
                />
              </Flex>
            )}
            <Image
              transform='scale(1.0)'
              src={selectedSelfPhoto}
              alt='Cars'
              objectFit='cover'
              width='100%'
              height='120px'
              transition='0.3s ease-in-out'
              _hover={{
                transform: "scale(1.05)",
              }}
            />
          </Box>
        )}
      </SimpleGrid>
      <Modal onClose={onClose} size={"md"} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton
            onClick={() => {
              setDisableUntilWebcam(true);
              setSelectedSelfPhoto("");
              setSelfPhoto("");
              onClose();
            }}
          />
          <ModalBody>
            {!selectedSelfPhoto ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat='image/jpeg'
                videoConstraints={videoConstraints}
              />
            ) : (
              <Image src={selectedSelfPhoto} />
            )}
          </ModalBody>
          <ModalFooter>
            {selectedSelfPhoto != "" ? (
              <>
                <Button
                  color={"black"}
                  onClick={() => {
                    setSelectedSelfPhoto("");
                    setSelfPhoto("");
                    onClose();
                    setDisableUntilWebcam(true);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color={"black"}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedSelfPhoto("");
                    setTimeout(() => {
                      setDisableUntilWebcam(false);
                    }, 3000);
                  }}
                >
                  Retake Image
                </Button>
                <Button
                  color={"black"}
                  onClick={() => {
                    setSelfPhoto(selectedSelfPhoto);
                    setSelfMode(true);
                    onClose();
                  }}
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  capture(e);
                }}
                color={"black"}
                isDisabled={disableUntilWebcam}
              >
                Capture
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
