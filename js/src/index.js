console.log("Hello BIS!")

const bip39 = require("bip39")
const QRCode = require('easyqrcodejs')
var hdkey = require('hdkey');
var createHash = require('create-hash');
var bs58check = require('bs58check');

import logo from './img/BIS_50_70b.png'
import i512 from './img/BIS_512.png'

const verbose = true

function generate_mnemonic(bits=128) {
  const mnemonic = bip39.generateMnemonic(bits)
  const element = document.querySelector("#BIP39-input")
  element.value = mnemonic
}


function generate_mnemonic12() {
    generate_mnemonic(128)
}


function generate_mnemonic24() {
    generate_mnemonic(256)
}

function generate_options() {
    const x = document.querySelector("#options")
    if (x.style.display === "none") {
        x.style.display = "block"
    } else {
        x.style.display = "none"
    }
}


function getKeyRowWithQR(index, path, privateKey, publicKey, address, paperCode, tHeadClass='') {
    return  `
        <div class="col-12">
          <table class="table" style="border: 1px solid #aaa;">
          <thead class="${tHeadClass}">
            <tr>
              <th>Keys</th><th>Values (Address ${index} - derive path ${path})</th><th>Address QR Code</th>
            </tr>
          </thead>
            <tr>
              <td>Address</td><td>${address}</td><td rowspan="3"  style="text-align:center; vertical-align:center"><div class="qr" id="qrcode_${index+1}"></div></td>
            </tr>
            <tr>
              <td>Private key</td><td>${privateKey}</td>
            </tr>
            <tr>
              <td>Public key</td><td><textarea class="form-control" >${publicKey}</textarea></td>
            </tr>
            <tr>
               <td colspan="3">paperCode ${index}: <textarea class="form-control" >${paperCode}</textarea>
               </td>
            </tr>
          </table>
        </div>
    `
}


function pubkey_to_address(publicKey) {
    const step1 = publicKey;
    const step2 = createHash('sha256').update(step1).digest();
    const step3 = createHash('rmd160').update(step2).digest();

    var step4 = Buffer.allocUnsafe(21+2);
    step4.writeUInt8(0x4f, 0);
    step4.writeUInt8(0x54, 1);
    step4.writeUInt8(0x5b, 2);
    //var step4 = Buffer.allocUnsafe(21);
    //step4.writeUInt8(0x00, 0);

    step3.copy(step4, 3); //step4 now holds the extended RIPMD-160 result
    //step3.copy(step4, 1);
    const step9 = bs58check.encode(step4);
    if (verbose) console.log('Base58Check: ' + step9);
    return step9;
}


function generate_addresses() {
    const mnemonic = document.querySelector("#BIP39-input").value.trim()
    const password = document.querySelector("#BIP39-pass").value.trim()
    // const seed = Buffer.from("c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646", 'hex');
    // BIP39 seul
    //const seed = Buffer.from("cfbca932381aefdf4381882cde67f7ff4123344c7f20614941b1fcdf754732f748d542278fff90365a16d187ab66676ad1b856bf7ff6b97d359ed945df654482", 'hex');
    // BIP39 + pw
    //const seed = Buffer.from("3762ef4e88a82be2d4338edc1e477533a5a023fbd3c102b938e65330022b7a7fa448b3fa07e795799fca0a261588f39db5445835003bb417da33574f33802fbd", 'hex');
    var seed;
    if (password == '') {
        seed = bip39.mnemonicToSeedSync(mnemonic); //.slice(0,32); //creates seed buffer
    } else {
        seed = bip39.mnemonicToSeedSync(mnemonic, password); //.slice(0,32); //creates seed buffer
    }
    if (verbose) {
        //console.log('Seed: ' + seed);
        console.log('Seed hex: ' + seed.toString('hex'));
        console.log('mnemonic: ' + mnemonic);
    }
    // Komodo mode attempt
    //seed = createHash('sha256').update(seed).digest();
    //console.log('Seed hex: ' + seed.toString('hex'));

    const root = hdkey.fromMasterSeed(seed);
    //root.privateKey = seed
    //const root = hdkey.fromExtendedKey("xprv9ydRptzPhdNud67iHrKp6zdTivxFEciurMfM1GVEByQhR6gDqBAJZMgrv224Mv8nKtkxFt7PXzSjC7ZHFox19Esh5pH6R3ZDrhT989FFVCm");
    //console.log(root)
    var address =  pubkey_to_address(root.publicKey);
    //if (verbose) console.log('root addr: ' + address);

    const masterPrivateKey = root.privateKey.toString('hex');
    if (verbose) console.log('masterPrivateKey: ' + masterPrivateKey);

    const count = parseInt(document.querySelector("#BIP39-count").value, 10)
    const wrapper = document.querySelector("#addresses")
    let content = ''
    let extraClass=''
    let ids = []
    let i = 0
    let path = ''

    const ecdsa = document.querySelector("#ecdsa").checked
    const ed25519 = document.querySelector("#ed25519").checked
    const chameleon1 = document.querySelector("#chameleon1").checked
    const chameleon2 = document.querySelector("#chameleon2").checked


    for (i=0; i<count; i++) {
        // default ecdsa
        path = `m/44'/209'/0'/0/` + i.toString()
        if (chameleon2) {
            path = `m/44'/0'/0'/0/` + i.toString()
        }
        if (verbose) console.log("path "+path)
        const derived = root.derive(path);
        const papercode = bip39.entropyToMnemonic(derived.privateKey.toString('hex'))
        const bis_address =  pubkey_to_address(derived.publicKey);
        content += getKeyRowWithQR(i, path, derived.privateKey.toString('hex'),
                             derived.publicKey.toString('hex'), bis_address,
                             papercode, extraClass);

        ids.push(bis_address)
        if (extraClass =='') {extraClass = 'thead-light'} else {extraClass = ''}
    }
    wrapper.innerHTML = content
    // https://www.color-hex.com/color-palette/9753
    let config = { text: "", // Content
						width: 240, // Width
						height: 240, // Height
						//colorDark: "#630900", // Dark color
						//colorDark: "#000000", // Dark color
						colorDark: "#444444",
						colorLight: "#ffffff", // Light color
						//PO: '#630900', // Global Position Outer color. if not set, the defaut is `colorDark`
						//PI: '#630900',
						PO: '#5fa1ee', // Global Position Outer color. if not set, the defaut is `colorDark`
						PI: '#b364c2',
						quietZone: 0,
						// === Logo
						//logo: logo, // LOGO
						//					logo:"http://127.0.0.1:8020/easy-qrcodejs/demo/logo.png",
						//logoWidth:50,
						//logoHeight:70,
						//logoBackgroundColor: '#ffffff', // Logo background color, Invalid when `logBgTransparent` is true; default is '#ffffff'
						logoBackgroundTransparent: false, // Whether use transparent image, default is false
						backgroundImage: i512,
						backgroundImageAlpha: 0.4,
						autoColor: false,
						correctLevel: QRCode.CorrectLevel.M // L, M, Q, H - don't use L, not enough dup info to allow for the logo
						}
    for (i=1; i<=count; i++) {
        config.text = ids[i-1]
        let t = new QRCode(document.getElementById("qrcode_" + i), config)
    }
}

document.querySelector("#generate_mnemonic12").addEventListener("click", generate_mnemonic12)
document.querySelector("#generate_mnemonic24").addEventListener("click", generate_mnemonic24)
document.querySelector("#generate_addresses").addEventListener("click", generate_addresses)
document.querySelector("#generate_options").addEventListener("click", generate_options)

