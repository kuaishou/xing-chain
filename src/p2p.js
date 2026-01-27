const dgram=require('dgram')
const udp=dgram.createSocket('udp4')//创建udp连接

//uap接受信息
udp.on('message',(data,remote)=>{
    console.log('accept message' + data.toString())
    console.log('remote',remote)
})
udp.on('listening',()=>{
    const address=udp.address()
    console.log('udp server is listening'+address.address+':'+address.port)
})
// udp.bind(8002)
udp.bind(0)//0服务会随机分配一个端口号
//启动服务  node src/p2p.js  8002  47.94.5.240


function send(message,port,host){
    console.log('send message',message,port,host)
    udp.send(Buffer.from(message),port,host)
}

const port=Number(process.argv[2])
const host=process.argv[3]
if(port&&host){
    send('你好啊',port,host)
}
