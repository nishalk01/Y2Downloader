const fs = require('fs');
const ytdl = require('ytdl-core');
const express=require("express");
// var ffmpeg = require('fluent-ffmpeg');
var cors = require('cors');
const { v4: uuidv4 } = require('uuid');
// const baseURL="http://localhost:8000"
const baseURL="http://192.168.0.104:8000/"


app=express();
app.use(cors())
app.use(express.json());
app.use(express.static("video"))
app.use(express.urlencoded({
    extended: true
  }))

function millisToMinutes(millis) {
    var minutes = Math.floor(millis / 60000);
    return minutes 
  }
  
const DeleteFiles=(file)=>{
        // Do whatever you want to do with the file
        const filePath="./video/"+file
        const { mtime, ctime } = fs.statSync(filePath)
        const currentTime=Date.parse(Date())
        const cTime=Date.parse(String(ctime))
        const ret=millisToMinutes(currentTime-cTime)
        if(ret>15){
            try {
                fs.unlinkSync(filePath);
            } catch (error) {
                console.log(error);
            }
        }
        else{
            console.log(filePath)
        }


}
setInterval(()=>{
    fs.readdir("./video/", (err, files)=>{
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach((file)=>{
            DeleteFiles(file)
        });
      
    }) 
},900000)



app.post("/getInfo", (req,res)=>{
   
    const requested_url=req.body.url
    const videoID=ytdl.getVideoID(requested_url)
    
    ytdl.getInfo(videoID).then(info=>{
        let {title,thumbnails}=info.videoDetails
        let availabe_tags=[]
        info.formats.map(inf=>{
  
            videoAvailable={"itag":inf.itag,"contentLength":inf.contentLength}
            availabe_tags.push(videoAvailable)
        })
    

    const video_img_url=thumbnails[thumbnails.length-1].url
    

    const tag_250={"itag":false,size:0,"content":"audio",tagVal:250}
    const tag_278={"itag":false,size:0,"content":"144p(.mp4)",tagVal:278};
    //242 for 240p video 
    const tag_242={"itag":false,size:0,"content":"240p(.mp4)",tagVal:242};
    // 360p 
    const tag_18={"itag":false,size:0,"content":"360p-(.mp4)",tagVal:18};
    const tag_243={"itag":false,size:0,"content":"360p(.mp4)",tagVal:243};
    // 480p
    const tag_244={"itag":false,size:0,"content":"480p(.mp4)",tagVal:244};
    // 720p 
    const tag_22={"itag":false,size:0,"content":"720p-(.mp4)",tagVal:22};


    availabe_tags.map(tag=>{
        switch(tag.itag) {
            case 250:{
                // 250 for audio 
                tag_250.itag=true;
                tag_250.size=tag.contentLength;
                
                break;
            }
            case 278:{
                // 278 for video(144p)
                tag_278.itag=true;
                tag_278.size=tag.contentLength;
                break;   
            }
            case 242:{
                //242 for 240p video 
                tag_242.itag=true;
                tag_242.size=tag.contentLength;
                break;
            }  
            case 18:{
                // 360p video
                tag_18.itag=true;
                tag_18.size=tag.contentLength;
                break;   
            };
            case 243:{
                // 360p video
                tag_243.itag=true;
                tag_243.size=tag.contentLength;
                break;   
            }
            case 244:
                // 480p video
                tag_244.itag=true;
                tag_244.size=tag.contentLength;
                break;   

            
            case 22:{
                // 720p video
                tag_22.itag=true;
                tag_22.size=tag.contentLength;
                break;
            }
                //TODO add 1080p if needed   

            default:
              break;
          } 
    })
   

    let availableVid=[]
    // check to see if quality is available
    // 144p
    if(tag_250.itag===true)
    // if webm audio is available 
    {
        if(tag_278.itag===true){
        //    144p is available 
        availableVid.push(tag_278)
        }
        if(tag_242.itag===true){
            // 240p
            availableVid.push(tag_242)
        }
        if(tag_18.itag==true&&tag_243.itag===true){
            availableVid.push(tag_18)
            // 360p
        }
        else if(tag_18.tag==true){
            // 360p1
            availableVid.push(tag_18)
        }
        else if(tag_243.itag==true){
            // 360p
            availableVid.push(tag_243)
        }
        if(tag_244.itag==true){
            // 480p
            availableVid.push(tag_244)
        }
        if(tag_22.itag==true){
            availableVid.push(tag_22)
        }

    }
    // audio is availabl or not 
   

    const response_data={
        img:video_img_url,
        title:title,
        videoData:availableVid
    }
    res.json(response_data)
    
    
})
// end of aysnc getInfo
})
// end of route


app.post("/download",async (req,res)=>{
    const requestData=req.body;
   
    const SaveFolder=`./video/`
    
    if(requestData.tagVal==18 || requestData.tagVal==22){
        const videoName=`vid_${requestData.vidTitle}${uuidv4()}.mp4`.replace(/['"\s/]+/g, '')
        console.log(videoName)
        ytdl(requestData.vidURL,{quality:requestData.tagVal}).on("error",()=>{
            res.status(500).send('Something went!')
        })
        .pipe(fs.createWriteStream(`./video/${videoName}`)).on("finish",()=>{
            console.log("completed downloading")
            const VideoPath={
                combine:false,
                DownloadURL:baseURL+"/"+videoName
            }
            res.json(VideoPath)

        }).on("error",(err)=>{
            res.status(500).send('Something broke!')
            console.log("something went wrong")
        });
       
      
    }
    else{
        const videoName=`${requestData.vidTitle}${uuidv4()}.webm`
        const AudioName=`AUD_${videoName}`
        const audioFileB=AudioName.replace(/['"\s/]+/g, '')
        const videoFileB=videoName.replace(/['"\s/]+/g, '')
        const videoFile=`${SaveFolder}${videoFileB}`
        const audioFile=`${SaveFolder}${audioFileB}`
       
        console.log(String(audioFile))
        console.log(String(videoFile))
      
        // this method of handling asynchronous task sucks callBack-hell
        ytdl(requestData.vidURL,{quality:requestData.tagVal})
        .pipe(fs.createWriteStream(videoFile)).on("error",()=>{
            res.status(500).send('Something went!')
        })
        .on("finish",()=>{
            console.log("Done downloading video")
            ytdl(requestData.vidURL,{quality:"250"})
            .pipe(fs.createWriteStream(audioFile)).on('finish',()=>{

                        console.log("Done saving file")
                    let VideoPath={
                        combine:true,
                        DownloadVidURL:baseURL+"/"+videoFileB,
                        DownloadAudURL:baseURL+"/"+audioFileB,
                        videoName:videoFileB
                         }
                         
                    res.json(VideoPath)
                    }).on("error",()=>{
                        res.status(500).send('Something went!')
                    })
            })
    

       
     
        
            }




})




app.listen(8000,()=>{
    console.log("listening at http://localhost:8000")
})







