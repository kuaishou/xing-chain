//1、私钥公钥
// 2、公钥直接当成地址使用（或者截取公钥前20位）
// 3、公钥可以通过私钥计算出来
let fs = require('fs')
let EC = require("elliptic").ec
let ec = new EC("secp256k1")
let keypair = ec.genKeyPair();

function getPub(prv) {
    return ec.keyFromPrivate(prv).getPublic('hex').toString()
}
const keys = generateKeys()
// console.log(keys)

//获取公钥和私钥
function generateKeys() {

    const fileName = './wallet.json'
    try {
        let res = JSON.parse(fs.readFileSync(fileName))
        if (res.prv && res.pub && getPub(res.prv) === res.pub) {
            keypair = ec.keyFromPrivate(res.prv)
            return res;
        } else {
            throw 'not valid wallet.json'
        }
    } catch (error) {
        //没有wallet文件就重新写一个wallet.json
        const res = {
            //私钥
            prv: keypair.getPrivate('hex').toString(),
            // 公钥
            pub: keypair.getPublic('hex').toString(),
        }
        fs.writeFileSync(fileName, JSON.stringify(res))
    }
}

// 2、签名
function sign({ from, to, amout, timestamp }) {
    const bufferMsg = Buffer.from(`${timestamp}-${amout}-${from}-${to}`)
    let signature = Buffer.from(keypair.sign(bufferMsg).toDER()).toString('hex')
    return signature
}

// 3/校验签名--校验是没有私钥的，是公钥校验
function verify({ from, to, amout, timestamp, signature }, pub) {
    //校验是没有私钥的
    const keypairTemp = ec.keyFromPublic(pub, 'hex')
    const bufferMsg = Buffer.from(`${timestamp}-${amout}-${from}-${to}`)
    return keypairTemp.verify(bufferMsg, signature)
}

//验证一下
// const trans = { from: 'xing', to: 'jiang', amout: 100 }
// const trans1 = { from: 'xing11', to: 'jiang', amout: 100 }
// const signature = sign(trans)
// trans.signature = signature
// console.log('签名', signature)
// const isVerify = verify(trans, keys.pub)
// console.log('校验签名', isVerify)

// //用未被签名的trans1进行校验
// trans1.signature = signature
// const isVerify1 = verify(trans1, keys.pub)
// console.log('校验签名错误', isVerify1)
module.exports = {
  sign,
  verify,
  keys
};