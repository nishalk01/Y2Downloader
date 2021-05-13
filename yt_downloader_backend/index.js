const fs = require('fs');
const ytdl = require('ytdl-core');
const express=require("express");
var ffmpeg = require('fluent-ffmpeg');
var cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const baseURL="http://localhost:8000"
// TypeScript: import ytdl from 'ytdl-core'; with --esModuleInterop
// TypeScript: import * as ytdl from 'ytdl-core'; with --allowSyntheticDefaultImports
// TypeScript: import ytdl = require('ytdl-core'); with neither of the above

app=express();
app.use(cors())
app.use(express.json());
app.use(express.static("video"))
app.use(express.urlencoded({
    extended: true
  }))

const url="https://youtu.be/fZkze8cKHgI"


// async function DownloadVideo(){
     
//      try{
//         const vid=await ytdl(url,{quality:"22"});
       
//      }
//      catch(err){
//          console.log(err)
//      }
//      await vid.pipe(fs.createWriteStream('video3.mp4')).on("close",()=>{
//         console.log("done man")
//     })
   
// }

// handle exception if a user chooses quality that doesnt exists

 

// const videoID=ytdl.getVideoID(url)
//  ytdl.getInfo(videoID).then(info=>{
//     info.formats.map(inf=>{
//         console.log(inf.itag)
//     })

// })
async  function DownloadandComibne(){

}

app.post("/getInfo",(req,res)=>{
    // get video url
    // ytdl.getInfo(videoID).then(info)
    const requested_url=req.body.url
    const videoID=ytdl.getVideoID(requested_url)
    // console.log(videoID)
    // ytdl.getInfo(v)
    // let retDta=fs.readFileSync("./response.json");
    // let data_=JSON.parse(retDta)

    //return all available itags along with content-type in MB
    // also return thumbnail url(best )
    //144p 
    ytdl.getInfo(videoID).then(info=>{
        let {title,thumbnails}=info.videoDetails
        let availabe_tags=[]
        info.formats.map(inf=>{
  
            videoAvailable={"itag":inf.itag,"contentLength":inf.contentLength}
            availabe_tags.push(videoAvailable)
        })
    

    const video_img_url=thumbnails[thumbnails.length-1].url
    // 250 for audio and 278 for video(144p)
    // let tag_250,tag_278,tag_242,tag_18,tag_243,tag_244,tag_22;
    // tag_250=tag_278=tag_242=tag_18=tag_243=tag_244=tag_22=tag_del={"itag":false,size:0}

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
    console.log(requestData.tagVal)
    console.log(requestData.vidURL)
    const SaveFolder=`./video/`
    
    if(requestData.tagVal==18 || requestData.tagVal==22){
        const videoName=`${requestData.vidTitle}${uuidv4()}.mp4`
        console.log(videoName)
        ytdl(requestData.vidURL,{quality:requestData.tagVal})
        .pipe(fs.createWriteStream(`./video/${videoName}`)).on("finish",()=>{
            console.log("completed downloading")
            const VideoPath={
                combine:false,
                DownloadURL:baseURL+"/"+videoName
            }
            res.json(VideoPath)

        });
       
      
    }
    else{
        // add video and audio by downloading them seperately
        const videoName=`${requestData.vidTitle}${uuidv4()}.webm`
        const AudioName=`AUD_${videoName}`
        // const videoName="something.mp4"
        // const AudioName="something-aud.webm"
        const audioFileB=AudioName.replace(/['"\s]+/g, '')
        const videoFileB=videoName.replace(/['"\s]+/g, '')
        const videoFile=`${SaveFolder}${videoFileB}`
        const audioFile=`${SaveFolder}${audioFileB}`
       
        console.log(String(audioFile))
        console.log(String(videoFile))
        res.status(200)
        let checkVidPath={
            combine:true,
            DownloadVidURL:"http://localhost:8000/Vivy:FluoriteEyesSongOpening1-SingMyPleasurebyVivy(KairiYagi)b47f4c5f-faef-4ab5-831b-67159c41a229.webm",
            DownloadAudURL:"http://localhost:8000/AUD_Vivy:FluoriteEyesSongOpening1-SingMyPleasurebyVivy(KairiYagi)b47f4c5f-faef-4ab5-831b-67159c41a229.webm",
            videoName:"Vivy:FluoriteEyesSongOpening1-SingMyPleasurebyVivy(KairiYagi)b47f4c5f-faef-4ab5-831b-67159c41a229.webm"
        }
        res.json(checkVidPath)
        // this method of handling asynchronous task sucks callBack-hell
        // ytdl(requestData.vidURL,{quality:requestData.tagVal})
        // .pipe(fs.createWriteStream(videoFile))
        // .on("finish",()=>{
        //     console.log("Done downloading video")
        //     ytdl(requestData.vidURL,{quality:"250"})
        //     .pipe(fs.createWriteStream(audioFile)).on('finish',()=>{
        //         //   ffmpeg()
        //         //     .addInput(String(videoFile))
        //         //     .addInput(String(audioFile))
        //         //     .on('error', function(err) {
        //         //     console.log('An error occurred: ' + err.message);
        //         //     })
        //         //     .on("end",()=>{
        //         //         console.log("Finished creating video")
        //         //     })
        //         //     .save("./video/file.mp4").on("end",()=>{

        //                 console.log("Done saving file")
        //             let VideoPath={
        //                 combine:true,
        //                 DownloadVidURL:baseURL+"/"+videoFileB,
        //                 DownloadAudURL:baseURL+"/"+audioFileB,
        //                 videoName:videoFileB


        //                  }
                        
                    
        //             res.json(VideoPath)
        //             })
        //     })
    

        // })
       
        // const videoFile=`./video/Vivy: Fluorite Eye's Song Opening 1 - "Sing My Pleasure" by Vivy (Kairi Yagi)c2f3e121-2066-43ce-b207-91da4b2af196.webm`
        // const audioFile=`./video/AUD_Vivy: Fluorite Eye's Song Opening 1 - "Sing My Pleasure" by Vivy (Kairi Yagi)c2f3e121-2066-43ce-b207-91da4b2af196.webm`
         
        
            }




})




// ytdl.getInfo(videoID).then(info=>{
//    console.log(info)
//    fs.writeFile("response.json",JSON.stringify(info,null, 4),(err)=>{
//        if(err) throw err;
//        console.log("response saved")
//    })
   
// })

// ytdl(url,{quality:"160"})
//   .pipe(fs.createWriteStream('video1.mp4'));

// ytdl(url,{quality:"249"})
// .pipe(fs.createWriteStream("video1.webm"))




app.listen(8000,()=>{
    console.log("listening at http://localhost:8000")
})







// will create a video output with audio and video input
// ffmpeg()
// .addInput("./video1.mp4")
// .addInput('./video1.webm')
// .on('error', function(err) {
// console.log('An error occurred: ' + err.message);
// })
// .on('end', function() {
// console.log('Final video created!');
// }).save("file.mp4")


// 249          webm       audio only tiny   49k , webm_dash container, opus @ 49k (48000Hz), 1.65MiB
// 250          webm       audio only tiny   67k , webm_dash container, opus @ 67k (48000Hz), 2.24MiB
// 140          m4a        audio only tiny  129k , m4a_dash container, mp4a.40.2@129k (44100Hz), 4.29MiB
// 251          webm       audio only tiny  136k , webm_dash container, opus @136k (48000Hz), 4.53MiB
// 160          mp4        256x144    144p   52k , mp4_dash container, avc1.4d400c@  52k, 30fps, video only, 1.75MiB
// 278          webm       256x144    144p   58k , webm_dash container, vp9@  58k, 30fps, video only, 1.93MiB
// 242          webm       426x240    240p   91k , webm_dash container, vp9@  91k, 30fps, video only, 3.03MiB
// 133          mp4        426x240    240p  114k , mp4_dash container, avc1.4d4015@ 114k, 30fps, video only, 3.80MiB
// 243          webm       640x360    360p  157k , webm_dash container, vp9@ 157k, 30fps, video only, 5.23MiB
// 134          mp4        640x360    360p  215k , mp4_dash container, avc1.4d401e@ 215k, 30fps, video only, 7.14MiB
// 244          webm       854x480    480p  250k , webm_dash container, vp9@ 250k, 30fps, video only, 8.30MiB
// 135          mp4        854x480    480p  377k , mp4_dash container, avc1.4d401f@ 377k, 30fps, video only, 12.48MiB
// 247          webm       1280x720   720p  517k , webm_dash container, vp9@ 517k, 30fps, video only, 17.13MiB
// 136          mp4        1280x720   720p  767k , mp4_dash container, avc1.4d401f@ 767k, 30fps, video only, 25.41MiB
// 18           mp4        640x360    360p  375k , avc1.42001E, 30fps, mp4a.40.2 (44100Hz), 12.42MiB
// 22           mp4        1280x720   720p  895k , avc1.64001F, 30fps, mp4a.40.2 (44100Hz) (best)


// 18 both audio and video (360p)
// 22 both ausio and video @ 720p
// 

// const tag_250={"itag":false,size:0,"content":"audio",tagVal:250} //webm
//     const tag_278={"itag":false,size:0,"content":"144p(.mp4)",tagVal:278}; //144p webm
//     //242 for 240p video  webm
//     const tag_242={"itag":false,size:0,"content":"240p(.mp4)",tagVal:242}; 
//     // 360p 
//     const tag_18={"itag":false,size:0,"content":"360p-(.mp4)",tagVal:18}; (.mp4)
//     const tag_243={"itag":false,size:0,"content":"360p(.mp4)",tagVal:243};(webm)
//     // 480p
//     const tag_244={"itag":false,size:0,"content":"480p(.mp4)",tagVal:244};(webm)
//     // 720p 
//     const tag_22={"itag":false,size:0,"content":"720p-(.mp4)",tagVal:22};(mp4)

// video only

// 160 only video 144p
// 133 only video 240p


// audio only 

// 250 webm audio only,use for 240p

//249 webm audio only ,use for 144p 





// 249          webm       audio only tiny   55k , webm_dash container, opus @ 55k (48000Hz), 1.88MiB
// 250          webm       audio only tiny   72k , webm_dash container, opus @ 72k (48000Hz), 2.47MiB
// 140          m4a        audio only tiny  129k , m4a_dash container, mp4a.40.2@129k (44100Hz), 4.42MiB
// 251          webm       audio only tiny  140k , webm_dash container, opus @140k (48000Hz), 4.80MiB
// 160          mp4        144x144    144p   11k , mp4_dash container, avc1.4d400b@  11k, 25fps, video only, 397.08KiB
// 278          webm       144x144    144p   18k , webm_dash container, vp9@  18k, 25fps, video only, 654.14KiB
// 394          mp4        144x144    144p   30k , mp4_dash container, av01.0.00M.08@  30k, 25fps, video only, 1.05MiB
// 133          mp4        240x240    240p   18k , mp4_dash container, avc1.4d400c@  18k, 25fps, video only, 647.92KiB
// 395          mp4        240x240    240p   42k , mp4_dash container, av01.0.00M.08@  42k, 25fps, video only, 1.46MiB
// 242          webm       240x240    240p   46k , webm_dash container, vp9@  46k, 25fps, video only, 1.60MiB
// 134          mp4        360x360    360p   29k , mp4_dash container, avc1.4d4015@  29k, 25fps, video only, 1.02MiB
// 396          mp4        360x360    360p   79k , mp4_dash container, av01.0.00M.08@  79k, 25fps, video only, 2.72MiB
// 243          webm       360x360    360p   90k , webm_dash container, vp9@  90k, 25fps, video only, 3.08MiB
// 135          mp4        480x480    480p   41k , mp4_dash container, avc1.4d401e@  41k, 25fps, video only, 1.41MiB
// 397          mp4        480x480    480p  119k , mp4_dash container, av01.0.01M.08@ 119k, 25fps, video only, 4.09MiB
// 244          webm       480x480    480p  137k , webm_dash container, vp9@ 137k, 25fps, video only, 4.71MiB
// 136          mp4        720x720    720p   59k , mp4_dash container, avc1.4d401f@  59k, 25fps, video only, 2.05MiB
// 398          mp4        720x720    720p  197k , mp4_dash container, av01.0.04M.08@ 197k, 25fps, video only, 6.75MiB
// 247          webm       720x720    720p  249k , webm_dash container, vp9@ 249k, 25fps, video only, 8.52MiB
// 137          mp4        1080x1080  1080p  142k , mp4_dash container, avc1.640020@ 142k, 25fps, video only, 4.88MiB
// 399          mp4        1080x1080  1080p  245k , mp4_dash container, av01.0.08M.08@ 245k, 25fps, video only, 8.39MiB
// 248          webm       1080x1080  1080p  416k , webm_dash container, vp9@ 416k, 25fps, video only, 14.23MiB
// 18           mp4        360x360    360p  140k , avc1.42001E, 25fps, mp4a.40.2 (44100Hz), 4.80MiB (best)



// 