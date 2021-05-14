import React,{useState} from 'react'
import { Box,Input,Center,InputRightElement,Button,InputGroup,Flex,Table,useToast,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Image,
    TableCaption,Text,Spinner ,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Link,
    useDisclosure,
    Progress} from "@chakra-ui/react";
  import axios from 'axios';
  import fileDownload from 'js-file-download';
  import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
  // maxresdefault.webp
  // const baseURL="http://localhost:8000/"
  const baseURL="http://192.168.0.104:8000/"

  
// https://stackoverflow.com/questions/28735459/how-to-validate-youtube-url-in-client-side-in-text-box
function ValidateYoutubeURL(str){
if(str!=undefined || str !=''){
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        var match = str.match(regExp);
        if (match && match[2].length == 11) {
        // Do anything for being valid
        return true
        // if need 
        }
        else{
        return false
        }

}
}

function getRandomString(length) {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for ( var i = 0; i < length; i++ ) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}



 function HomePage() {

    const [videoURL,setVideoURL]=useState(null)
    const [responseData,setResponseData]=useState([])
    const [title,setTitle]=useState(null)
    const [Vidimage,setVidimage]=useState(null)
    const [RetStatus,setRetStatus]=useState(false);
    const [loading,setLoading]=useState(false);
    const [done,setDone]=useState(null)
    const [ratio,setRatio]=useState(null)
    const [downloadURL,setDownloadURL]=useState({
      showButton:false,
      downloadURL:null
    })

    const ffmpeg = createFFmpeg({
      log: true,
      progress: ({ ratio }) => {
        // make a progress bar with modal using this value
        console.log( `Complete: ${(ratio * 100.0).toFixed(2)}%`);
        setRatio((ratio * 100.0).toFixed(2))
      },
    });
  

    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = React.useRef()



    const CombineAndDownload=async (AudioURL,videoURL,videoName)=>{
      // try to catch exceptions
      const AudioName="AUD_"+videoName;
      console.log(AudioName)
      let outputFileName=`${title}.mp4`.replace(/[^\x20-\x7E]/gu, "").replace(/ +/, " ")
      if(!ffmpeg.isLoaded()){
        await ffmpeg.load();
      }
     
      console.log('Start transcoding')
     
      try{
        ffmpeg.FS('writeFile', videoName, await fetchFile(videoURL));
        ffmpeg.FS('writeFile',AudioName,await fetchFile(AudioURL));
        await ffmpeg.run('-i', videoName,'-i' ,AudioName,'-y','-acodec','copy','-vcodec', 'copy',outputFileName);
        // ffmpeg -i audioFile.au -i videoFile.mp4 -y -acodec copy -vcodec copy mergedFile.mp4  
        console.log('Complete transcoding')
        var data = ffmpeg.FS('readFile', outputFileName);
        const blobUrl  = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.target = "_blank";
        anchor.download = outputFileName;
        anchor.click();
        onClose()
        URL.revokeObjectURL(blobUrl);
        }
      
      catch(err){
        let outputFileNameR=String(getRandomString(10))
        let videoName_catch="CATCH"+outputFileName+".webm"
        let AudioName_catch="AUD_"+videoName_catch
        let outputFileName_catch=outputFileNameR+".mp4"
        
        ffmpeg.FS('writeFile', videoName_catch, await fetchFile(videoURL));
        ffmpeg.FS('writeFile',AudioName_catch,await fetchFile(AudioURL));
        await ffmpeg.run('-i', videoName_catch,'-i' ,AudioName_catch,'-y','-acodec','copy','-vcodec', 'copy',outputFileName_catch);
        // ffmpeg -i audioFile.au -i videoFile.mp4 -y -acodec copy -vcodec copy mergedFile.mp4  
        console.log('Complete transcoding')
        var data = ffmpeg.FS('readFile', outputFileName_catch);
        const blobUrl  = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.target = "_blank";
        anchor.download = outputFileName_catch;
        anchor.click();
        onClose()
        URL.revokeObjectURL(blobUrl);

      }
      toast({
        title: "Downloading",
        description: "The download has already started",
        status: "info",
        duration: 3000,
        isClosable: true,
      })
      
     
    }

  const handleChange=(e)=>{
    e.persist();
    if(e.target.id==="videoURL"){ //add validation later on
      setVideoURL(e.target.value)
      // console.log(validURL(e.target.value))
    }

  }
  const handleSelection=(e)=>{
    e.persist();
    console.log(e.target.id)
    if(e.target.id==18||e.target.id==22){
      setDone("direct")
      onOpen()
      
      
    }
    else{
      setDone("processed")
      onOpen()
    }
    axios.post(baseURL+"download",{
      tagVal:e.target.id,
      vidURL:videoURL,
      vidTitle:title
    }).then(res=>{
      console.log(res)
      if(!res.data.combine){
        console.log(res.data.DownloadURL)
        // fileDownload(res.data.DownloadURL, `${title}.mp4`);
       setDownloadURL({
         showButton:true,
         downloadURL:res.data.DownloadURL})


      }
      else if(res.data.combine){
        
        console.log(res.data)
        const retCombineData=res.data;
        const vidName=retCombineData.videoName
        CombineAndDownload(retCombineData.DownloadAudURL,retCombineData.DownloadVidURL,vidName.replace(/:/g, ""))
      }
      //  window.href=res.data.DownloadURL
      
    })
    .catch(err=>{
      console.log(err)
      onClose()
      if(err.response.status==500){
        toast({
          title: "Something went wrong",
          description: "This error occured because  server couldnt download file",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
      
      setDownloadURL({
        showButton:false,
        downloadURL:null})

    })
    // make a post request to server asking to download the file
  }



  const handleSubmit=(e)=>{
    e.preventDefault()
    
    let valid=ValidateYoutubeURL(videoURL);
    if(valid){
      setLoading(true)
      axios.post(baseURL+"getInfo",{
        url:videoURL
      })
      .then(res=>{
             let RetData=res.data;
             setTitle(RetData.title);
             setVidimage(RetData.img); 
             setResponseData(RetData.videoData);
             setLoading(false);
             setRetStatus(true);


      })
      .catch(err=>{
        console.log(err)
        setLoading(false)
      })
    }
    else{
      toast({
        title: "Enter a valid URL.",
        description: "This error occured because the url entered is not valid",
        status: "error",
        duration: 9000,
        isClosable: true,
      })
    }
    // validate url before sending request to server
     
  }

  const ResolutionList=responseData.length?(
      responseData.map(resData=>{
          return(
            <Tr>
            <Td>{resData.content}</Td>
            <Td>{formatBytes(resData.size)}</Td>
            <Td ><Button colorScheme="green" id={resData.tagVal} variant="solid" onClick={handleSelection}>Download📥</Button></Td>
          </Tr>
          )
       
      })
  ):(<Text fontSize="xs">Something went wrong</Text>)

    return (
        <Flex color="black" direction="column" style={{fontFamily:"sans-serif"}}>
         
       <Box bg="#00aaff" w="100%" p={4}  >
         <div style={{ flexDirection:"row" }}>

         <h1 style={{color:"black",fontWeight:"bold"}}> Y2DOWNLOADER 📥</h1>
         <Text fontSize="xs">Source Code</Text>
         </div>
 
 
</Box>







<Center w="64%"  style={{ flex:1,flexDirection:"column",marginTop:"3%",marginLeft:"20%"}}>
<InputGroup size="lg" style={{marginBottom:"2%"}}  >

<Input variant="outline" placeholder="Enter Youtube URL" id="videoURL" onChange={handleChange} />
      <InputRightElement width="4.5rem">
      <Button colorScheme="green" variant="solid" isLoading={loading} onClick={handleSubmit}>➡</Button>
      </InputRightElement>
    
    </InputGroup>
    
    <Drawer
        isOpen={isOpen}
        placement="bottom"
        
        onClose={onClose}
        finalFocusRef={btnRef}
        closeOnOverlayClick={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Downloading Video from Server</DrawerHeader>
          <DrawerBody>

         {done=="direct"?(<>
         {downloadURL.showButton?(
           <Button variant="solid" colorScheme="whatsapp" >
           <Link href={downloadURL.downloadURL} download>
            Download
         </Link>
         </Button>
          
)
            :(<><Progress colorScheme="twitter" hasStripe isAnimated={true} value={100} />
            <Text style={{fontWeight:"bold" }} fontSize="md" >This will take some time Depending on File Size </Text></>)}
          
            
               
         
            </>):null} 

            {done=="processed"?(<>
            {ratio===null?
                (<Progress colorScheme="twitter" hasStripe isAnimated={true} value={100} />):
                (ratio!=100?(<Progress colorScheme="whatsapp" hasStripe isAnimated={true} value={ratio} />):(
                  <Text style={{fontWeight:"bold" }} fontSize="md" >File is already Downloading</Text>
                ))}
            <Center style={{flex:1,flexDirection:"column"}}>
            <Text style={{fontWeight:"bold" }} fontSize="md" >File Size is smaller because processing is done in your browser</Text>
            </Center></>):null} 

          </DrawerBody>
           
        

          <DrawerFooter>
            <Button variant="solid" colorScheme="red"  onClick={onClose}>
              Cancel
            </Button>
           
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

  

     

    {RetStatus?(<><Box maxW="lg"  borderRadius="lg" overflowX="hidden">
      <Image src={Vidimage} width="100%" alt="click on Image to Download" onClick={()=>{console.log("downloading image.....")}} />
</Box>
   <Text style={{alignSelf:"flex-start",fontWeight:"bold" }} fontSize="md" >{title} </Text>

    <Table  variant="striped" style={{ marginTop:'2%' }}>
  <TableCaption>Only small file size Downloads only</TableCaption>
  <Thead>
    <Tr>
      <Th>Resolution</Th>
      <Th>FileSize(in mb)</Th>
      <Th >DOWNLOAD</Th>
    </Tr>
  </Thead>

  <Tbody>
  {ResolutionList}
  </Tbody>
</Table>
</>):null}
{loading?(<Spinner
  thickness="4px"
  speed="0.65s"
  emptyColor="gray.200"
  color="red.500"
  size="xl"
/>):null}

<Text style={{ alignSelf:"center",fontWeight:"bold" }} fontSize="sm" >Made with <a href="https://chakra-ui.com/">ChakraUI</a>,NodeJS(mainly express and <a href="https://www.npmjs.com/package/ytdl-core">ytdl-core</a>) ❤️ </Text>
<Text style={{ alignSelf:"center" }} fontSize="xs" > This website only accepts proper Youtube url made for learning purpose and hosted on glitch </Text>
    </Center>



    </Flex>

    )
}


export default HomePage;