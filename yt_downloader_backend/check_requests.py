import requests
url="http://localhost:3000/"
youtube_url="https://youtu.be/ptTxK8CZ96Q"

youtube_url="https://youtu.be/lmfcL1sCp6w"

res=requests.post(url+"getInfo",data={"url":youtube_url})
print(res.json())