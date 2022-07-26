import Webcam from "react-webcam";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  chakra,
  Flex,
  useToast,
  VisuallyHidden,
  FormControl,
  Image,
  Input,
  Spinner,
  Center,
  Progress,
} from "@chakra-ui/react";
import { FaBeer } from "react-icons/fa";
import { CloseIcon } from "@chakra-ui/icons";

export default function DriverLicenseVerify() {
  const [dataFound, setDataFound] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(false);
  const { user } = useSelector((state) => state.authentication);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const toast = useToast();
  const dispatch = useDispatch();

  const [selfMode, setSelfMode] = useState(false);
  const [frontMode, setFrontMode] = useState(false);
  const [backMode, setBackMode] = useState(false);

  // Web cam functionalities

  const [disableUntilWebcam, setDisableUntilWebcam] = useState(true);

  const videoConstraints = {
    width: 410,
    height: 250,
    facingMode: "user",
  };

  const webcamRef = useRef(null);

  const capture = useCallback((e) => {
    const imageSrc = webcamRef.current.getScreenshot();
    setSelectedSelfPhoto(imageSrc);
  });

  const onCloseWebcam = useCallback(() => {
    setWebcamEnabled(false);
  }, [webcamEnabled]);

  // Add Driver and Driver License Card images
  const [isUploading, setIsUploading] = useState(false);

  const [selfPhoto, setSelfPhoto] = useState("");
  const [selectedSelfPhoto, setSelectedSelfPhoto] = useState("");

  const [dLFrontPhoto, setDLFrontPhoto] = useState("");
  const [selectedDLFrontPhoto, setSelectedDLFrontPhoto] = useState("");

  const [dLBackPhoto, setDLBackPhoto] = useState("");
  const [selectedDLBackPhoto, setSelectedDLBackPhoto] = useState("");

  const inputSelfPhoto = useRef(null);
  const inputDLFrontPhoto = useRef(null);
  const inputDLBackPhoto = useRef(null);

  const getLicenseData = async () => {
    setIsUploading(true);
    try {
      const data = await getAllDriverLicenseAction();
      if (data[0]?.selfe_with_id_photo) {
        setSelectedSelfPhoto(data[0]?.selfe_with_id_photo);
        setSelfMode(true);
        setSelectedDLFrontPhoto(data[0]?.dl_front_photo);
        setFrontMode(true);
        setSelectedDLBackPhoto(data[0]?.dl_back_photo);
        setBackMode(true);
        setDataFound(true);
      }
    } catch {
      toast({
        title: "Driver License Info missing!",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
    setIsUploading(false);
  };

  useEffect(() => {
    getLicenseData();
  }, []);

  // user photo
  const changeSelfPhotoHandler = (e) => {
    if (checkFileSize(e)) {
      setSelectedSelfPhoto(URL.createObjectURL(e.target.files[0]));
      setSelfPhoto(e.target.files[0]);
      setSelfMode(true);
    }
  };

  const handleSelfPhotoUpload = () => {
    inputSelfPhoto.current.click(changeSelfPhotoHandler);
  };

  const checkFileSize = (e) => {
    let file = e.target.files[0];

    if (file.size > 1000000) {
      toast({
        title: "File size is greater than 1MB!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  // Driver License Card Front
  const changeDLFrontPhotoHandler = (e) => {
    if (checkFileSize(e)) {
      setSelectedDLFrontPhoto(URL.createObjectURL(e.target.files[0]));
      setDLFrontPhoto(e.target.files[0]);
      setFrontMode(true);
    }
  };
  const handleDLFrontPhotoUpload = () => {
    inputDLFrontPhoto.current.click(changeDLFrontPhotoHandler);
  };

  // Driver License Card Back
  const changeDLBackPhotoHandler = (e) => {
    if (checkFileSize(e)) {
      setSelectedDLBackPhoto(URL.createObjectURL(e.target.files[0]));
      setDLBackPhoto(e.target.files[0]);
      setBackMode(true);
    }
  };
  const handleDLBackPhotoUpload = () => {
    inputDLBackPhoto.current.click(changeDLBackPhotoHandler);
  };

  const options = {
    onUploadProgress: (progressEvent) => {
      const { loaded, total } = progressEvent;
      let percent = Math.floor((loaded * 100) / total);
      if (percent < 96 && percent > 20) {
        setPercentage(percent);
      }

      // COMMENT NEEDED console.log(`${loaded}kb of ${total}kb | ${percent}%`);
    },
  };

  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    let formData = new FormData();

    if (selectedSelfPhoto && selectedDLFrontPhoto && selectedDLBackPhoto) {
      formData.append("user", user?.id);
      if (selfieTaken) {
        let selfie = dataURLtoFile(selfPhoto, "selfie.jpeg");
        formData.append("selfe_with_id_photo", selfie);
      } else {
        formData.append("selfe_with_id_photo", selfPhoto);
      }

      formData.append("dl_front_photo", dLFrontPhoto);
      formData.append("dl_back_photo", dLBackPhoto);

      try {
        setPercentage(20);
        const data = await dispatch(addDriverLicenseAction(formData, options));
        if (data.status === 201) {
          setPercentage(100);
          setDataFound(true);
          toast({
            title: "Driver license added",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch {
        toast({
          title: "Failed to add license",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      let title = "Photo is missing";
      if (!selfMode) {
        title = "Self " + title;
      } else if (!frontMode) {
        title = "Driver License Front " + title;
      } else if (!backMode) {
        title = "Driver License Back" + title;
      }

      toast({
        title,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
          <FaBeer color='black' />
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
      {/* <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ md: 5 }}> */}
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
              isDisabled={dataFound || selfMode}
              onClick={() => {
                if (webcamEnabled == false) {
                  navigator.mediaDevices
                    .getUserMedia({ video: true })
                    .then((stream) => {
                      setWebcamEnabled(!webcamEnabled);
                      setTimeout(() => {
                        setDisableUntilWebcam(false);
                      }, 3000);
                    })
                    .catch((err) => {
                      console.log("=> error", err);
                      toast({
                        title: "Camera missing!",
                        status: "error",
                        duration: 4000,
                        isClosable: true,
                      });
                    });
                } else {
                  setWebcamEnabled(!webcamEnabled);
                }
              }}
            >
              {webcamEnabled ? "Close the" : "Take a"} Selfie
            </Button>
            <Text
              color={"#718096"}
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight='light'
            >
              Or
            </Text>

            <>
              {!selfMode && (
                <Button
                  w={{ base: "150px", md: "180px" }}
                  fontSize={{ base: "sm", md: "md" }}
                  colorScheme='blue'
                  variant='outline'
                  onClick={handleSelfPhotoUpload}
                  isDisabled={webcamEnabled}
                >
                  Upload from drive
                  <Input
                    hidden
                    type={"file"}
                    accept='image/*'
                    ref={inputSelfPhoto}
                    onChange={changeSelfPhotoHandler}
                  ></Input>
                </Button>
              )}

              {selfMode && !frontMode && (
                <Button
                  w={{ base: "150px", md: "180px" }}
                  fontSize={{ base: "sm", md: "md" }}
                  colorScheme='blue'
                  variant='outline'
                  onClick={handleDLFrontPhotoUpload}
                >
                  Upload from drive
                  <Input
                    hidden
                    type={"file"}
                    accept='image/*'
                    ref={inputDLFrontPhoto}
                    onChange={changeDLFrontPhotoHandler}
                  ></Input>
                </Button>
              )}
              {selfMode && frontMode && !backMode && (
                <Button
                  w={{ base: "150px", md: "180px" }}
                  fontSize={{ base: "sm", md: "md" }}
                  colorScheme='blue'
                  variant='outline'
                  onClick={handleDLBackPhotoUpload}
                >
                  Upload from drive
                  <Input
                    hidden
                    type={"file"}
                    accept='image/*'
                    ref={inputDLBackPhoto}
                    onChange={changeDLBackPhotoHandler}
                  ></Input>
                </Button>
              )}
              {selfMode && frontMode && backMode && (
                <Button
                  w={{ base: "150px", md: "180px" }}
                  fontSize={{ base: "sm", md: "md" }}
                  colorScheme='blue'
                  variant='outline'
                  isDisabled='true'
                >
                  Upload from drive
                </Button>
              )}
            </>
          </HStack>
          {webcamEnabled && (
            <HStack spacing='15px' justify='center'>
              <Button
                color={"black"}
                onClick={() => {
                  setDisableUntilWebcam(true);
                  setSelectedSelfPhoto("");
                  setSelfPhoto("");
                  onCloseWebcam();
                }}
              >
                Cancel
              </Button>
              {selectedSelfPhoto != "" ? (
                <>
                  <Button
                    color={"black"}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedSelfPhoto("");
                    }}
                  >
                    Retake Image
                  </Button>
                  <Button
                    color={"black"}
                    onClick={() => {
                      onCloseWebcam();
                      setDisableUntilWebcam(true);
                      setSelfPhoto(selectedSelfPhoto);
                      setSelfMode(true);
                      setSelfieTaken(true);
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
            </HStack>
          )}
          <Box className='webcam-img'>
            {!selectedSelfPhoto && webcamEnabled && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat='image/jpeg'
                videoConstraints={videoConstraints}
              />
            )}
            {webcamEnabled && <Image src={selectedSelfPhoto} />}
          </Box>

          <Box>
            {isUploading ? (
              <Center>
                <Spinner
                  thickness='4px'
                  speed='0.65s'
                  emptyColor='gray.200'
                  color='blue.500'
                  size='xl'
                />
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 3, md: 3 }} spacing={2}>
                {selfMode && (
                  <Box position='relative' className='add-photo' boxShadow='lg'>
                    {!dataFound && (
                      <Flex className='icon-delete'>
                        <CloseIcon
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
                {frontMode && (
                  <Box position='relative' className='add-photo' boxShadow='lg'>
                    {!dataFound && (
                      <Flex className='icon-delete'>
                        <CloseIcon
                          onClick={() => (
                            setSelectedDLFrontPhoto(""), setFrontMode(false)
                          )}
                        />
                      </Flex>
                    )}
                    <Image
                      transform='scale(1.0)'
                      src={selectedDLFrontPhoto}
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

                {backMode && (
                  <Box position='relative' className='add-photo' boxShadow='lg'>
                    {!dataFound && (
                      <Flex className='icon-delete'>
                        <CloseIcon
                          onClick={() => (
                            setSelectedDLBackPhoto(""), setBackMode(false)
                          )}
                        />
                      </Flex>
                    )}
                    <Image
                      transform='scale(1.0)'
                      src={selectedDLBackPhoto}
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
            )}
          </Box>

          {selfMode && frontMode && backMode && (
            <Text
              color={"gray.700"}
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight='light'
            >
              Guarantee 24hr verification
            </Text>
          )}

          {!selfMode && (
            <Text
              color={"gray.700"}
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight='light'
              as='cite'
            >
              Click "Take a Selfie" or "Upload from Drive" for selfie with ID
              beside your face
            </Text>
          )}
          {selfMode && !frontMode && (
            <Text
              color={"gray.700"}
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight='light'
              as='cite'
            >
              Click "Upload from Drive" to choose your Driver License's front
              photo
            </Text>
          )}
          {selfMode && frontMode && !backMode && (
            <Text
              color={"gray.700"}
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight='light'
              as='cite'
            >
              Click "Upload from Drive" to choose your Driver License's back
              photo
            </Text>
          )}
        </VStack>
        <Box w={{ base: "full", md: "full", lg: "full", xl: "1/2" }}>
          <VStack spacing={4} alignItems={"left"}>
            <Text
              color={"#414143"}
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight='semibold'
            >
              Guideline for driving license verification
            </Text>
            <Text
              color={"#718096"}
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight='light'
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              scelerisque nisl at ligula finibus, varius gravida augue cursus.
              Donec nec pulvinar dolor. In scelerisque placerat porttitor. Nulla
              finibus condimentum dui a tristique. Etiam sit amet venenatis
              nisi. Donec dapibus dignissim purus a tempus. Fusce lobortis
              turpis sed hendrerit consectetur. Integer in mattis tellus.
            </Text>
            <Text
              color={"#718096"}
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight='light'
            >
              Take selfie with ID beside face
              <br />
              Take photo of front of DL
              <br />
              Take photo of back of DL
            </Text>

            <Box py={{ md: "4" }}>
              <VStack spacing={2} alignItems={"left"}>
                <Text
                  color={"#414143"}
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight='semibold'
                >
                  Photo Guideline
                </Text>
                <SimpleGrid columns={3} spacing={2}>
                  <Box bg='gray.300' height='120px'></Box>
                  <Box bg='gray.300' height='120px'></Box>
                  <Box bg='gray.300' height='120px'></Box>
                </SimpleGrid>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Stack>

      <Button mt={8} onClick={handleSubmit} isDisabled={dataFound}>
        Save
      </Button>
      <HStack>
        {percentage > 0 && <Progress hasStripe value={percentage} />}
      </HStack>
    </Box>
  );
}
