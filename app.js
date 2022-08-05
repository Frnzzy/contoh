const url = require('url')
const http = require('http')

const mongoose = require('mongoose')
mongoose.connect("mongodb://mahasiswa:if2020@if.unismuh.ac.id:27017/web", {}, (err, res) => {
    try {
        if(err) throw err
        console.log("Connected")
    }catch(err) {
        console.error(err)
    }
})

const schema = new mongoose.Schema({nim : String, nama : String, alamat : String, kelas : String, kelompok : String, nilai : Object})
const model = mongoose.model('mahasiswa', schema, "kelompok3D")

async function mongoeditNIM(nim, newNim) {
    try {

        if(mongoose.connection.readyState != 1) {
            return {
            status : 500, msg : `<h1>Database belum terhubung</h1>`
        }
    }
    if(nim == null) {
        return {
            status : 400,
            msg : "<h1>NIM KOSONG</h1>"
        }
    }
    const hasil = await model.findOneAndUpdate({nim:nim}, newNim, {
        new:true
    })
    return {status:200, msg:"<h1>Berhasil mengedit Data <a href='/profil?nim="+hasil.nim+"'>Kembali</a></h1>"}
    } finally {
    }
    
}
async function mongoinputNilai(nim, newNilai) {
    try {

        if(mongoose.connection.readyState != 1) {
            return {
            status : 500, msg : `<h1>Database belum terhubung</h1>`
        }
    }
    if(nim == null) {
        return {
            status : 400,
            msg : "<h1>NIM KOSONG</h1>"
        }
    }
    const hasil = await model.findOneAndUpdate({nim:nim}, newNilai, {
        new:true
    })
    console.log(hasil)
    return {status:200, msg:"<h1>Berhasil menginput Nilai <a href='/profil?nim="+hasil.nim+"'>Kembali</a></h1>"}
    } finally {

    }
    
}
async function mongogetNIM(nim) {
    if(mongoose.connection.readyState != 1 ){
        return {status : 500,msg : `<h1>Database belum terhubung</h1>`}
    }
    
    if(nim == null || nim == "") {
        return {
            status : 400,
            msg : "<h1>NIM KOSONG</h1>"
        }
    }
    const mahasiswa = await model.findOne({nim:nim})
    if(mahasiswa == null) {
        return {
            status : 404,
            msg : "<h1>Panjang nim tidak sesuai</h1>"
        }

    }
    
    return {
        status : 200,
        msg : mahasiswa
    }
}

async function mongogetAll() {
    if(mongoose.connection.readyState != 1) {
        return {status : 500,msg : `<h1>Database belum terhubung</h1>`}
    }
    const mahasiswa = await model.find({}).sort({nama:1})
    let hasil = ""
    mahasiswa.forEach(el => {
        hasil += `<tr onclick="window.location.href = '/profil?nim=${el.nim}'">
        
        <td>  ${el.nim} </td>
        <td>  ${el.nama} </td>

        </tr>`
    })
    return {
        status : 200,
        msg : `
        <h1>Daftar Mahasiswa</h1>
        <table>
        <thead>
        <th> NIM </th>
        <th> Nama </th>
        </thead>
        <tbody>
        ${hasil}
        </tbody>
        </table>
        `
    }
}


const server = http.createServer((req, res) => {
    const {pathname, query} = url.parse(req.url, true)
    if(pathname == "/") {
        res.writeHead(200, {
            'Content-Type':'text/html'
        })
        res.write(`<h1> TUGAS 3 WEB KELOMPOK 3 KELAS D . <a href="/daftar">Ke link ini untuk ke daftar</a></h1>`)
        res.end()
    } else if(pathname === "/daftar") {
        mongogetAll().then(dat => {
            res.writeHead(dat.status, {
                'Content-Type' : 'text/html'
            })
            console.log(dat.msg)
            res.write(dat.msg)
            res.end()
        }).catch(err => {
            console.log(err)
        })
    } else if(pathname == "/profil") {
        const {nim} = query
        mongogetNIM(nim).then(dat => {
            if(dat.status >= 400) {
            res.writeHead(dat.status, {
                'Content-Type' : 'text/html'
            })
            console.log(dat.msg)
            res.write(dat.msg)
            res.end()
            return 
            }
            res.writeHead(dat.status, {
                'Content-Type' : 'text/html'
            })
            const {msg} = dat
            let nilai = ``

            if(msg.nilai != null) {
                let hasil = 0
                for(const [key, val] of Object.entries(msg.nilai)) {
                    hasil = hasil + parseInt(val)
                } 
                hasil /= Object.keys(msg.nilai).length             
                nilai = `
                Nilai : <br>
            &nbsp; Tugas 1 : ${msg.nilai.tugas1} <br>
            &nbsp; Tugas 2 : ${msg.nilai.tugas2} <br>
            &nbsp; Tugas 3 : ${msg.nilai.tugas3} <br>
            &nbsp; Final : ${msg.nilai.final} <br>
            &nbsp; Rata-rata Tugas : ${hasil} </br>
            `

            } else {
                nilai = `
                Nilai : Belum diinput
                `
            }
            res.end(`
            <a href="/daftar">kembali</a>
            <h1> Detail mahasiswa</h1>
            <img src="https://simak.unismuh.ac.id/upload/mahasiswa/${msg.nim}.jpg">
            <h4> 
            NIM : ${msg.nim} <br>
            Nama : ${msg.nama} <br>
            Kelas : ${msg.kelas||"Kosong"} <br>
            Kelompok : ${msg.kelompok||"Kosong"} <br>
            Alamat : ${msg.alamat} <br>
            ${nilai}
            </h4>
            <a href="/edit?nim=${msg.nim}">Edit</a>
            <a href="/input?nim=${msg.nim}">Input</a>

            `)  
        })

    } else if(pathname == '/edit') {
        
        const {nim} = query
        mongogetNIM(nim).then(dat => {
            if(dat.status >= 400) {
            res.writeHead(dat.status, {
                'Content-Type' : 'text/html'
            })
            console.log(dat.msg)
            res.write(dat.msg)   
            res.end()
            return 
            }
            res.writeHead(dat.status, {
                'Content-Type' : 'text/html'
            })
            res.write(`<h1> Edit </h1>`)
            res.write(`
            <form method="POST" action="/edit2?nim=${dat.msg.nim}"> <br>
            NIM : <input type="text" name="nim" value="${dat.msg.nim}"><br>
            Nama : <input type="text" name="nama" value="${dat.msg.nama}"><br>
            Kelas : <input type="text" name="kelas" value="${dat.msg.kelas||""}"><br>
            Kelompok : <input type="text" name="kelompok" value="${dat.msg.kelompok||""}"><br>
            <button type="submit">Submit</button>
            </form>
            `)
        res.end()    
        })
        
        
    } else if(pathname == "/edit2") {
        const {nim} = query
        let chunks = ""
        req.on('data', chunk => chunks += chunk.toString())
        req.on('end', () => {
            const data = new URLSearchParams(chunks)
            console.log(data)
            mongoeditNIM(nim, {nama:data.get('nama'), nim:data.get('nim'),kelas:data.get('kelas'),kelompok:data.get('kelompok')}).then( el => {
                res.writeHead(el.status, {
                    'Content-Type' : 'text/html'
                })
                res.end(`<h1>${el.msg}</h1>`)
            }).catch(err => {
                res.writeHead(500, {
                    'Content-Type' : 'text/html'
                })
                res.end(`<h1>Server Error</h1>`)
                
            })
            
        })
    } 
     else if(pathname == "/input") {
        
        const {nim} = query
        mongogetNIM(nim).then(dat => {
            if(dat.status >= 400) {
            res.writeHead(dat.status, {
                'Content-Type' : 'text/html'
            })
            console.log(dat.msg)
            res.write(dat.msg)
            res.end()
            return 
            }
            res.writeHead(dat.status, {
                'Content-Type' : 'text/html'
            })
            res.write(`<h1> Input </h1>`)
            if(dat.msg.nilai == null) {
                dat.msg.nilai = {
                    tugas1:0,
                    tugas2:0,
                    tugas3:0,
                    final:0,
                }
            }
            res.write(`
            <form method="POST" action="/input2?nim=${dat.msg.nim}"> <br>
            Tugas1 : <input type="number" min=0 max=100 name="tugas1" value="${dat.msg.nilai.tugas1}" required><br>
            Tugas2 : <input type="number" min=0 max=100 name="tugas2" value="${dat.msg.nilai.tugas2}" required><br>
            Tugas3 : <input type="number" min=0 max=100 name="tugas3" value="${dat.msg.nilai.tugas3}" required><br>
            Final : <input type="number" min=0 max=100 name="final" value="${dat.msg.nilai.final}" required><br>
            
            <button type="submit">Submit</button>
            </form>
            `)
        res.end()    
        })
        
        
    } else if(pathname == "/input2") {
        const {nim} = query
        let chunks = ""
        req.on('data', chunk => chunks += chunk.toString())
        req.on('end', () => {
            const data = new URLSearchParams(chunks)
            console.log(data)
            mongoinputNilai(nim, 
                {nilai : 
                {
                    tugas1:data.get('tugas1'), 
                    tugas2:data.get('tugas2'), 
                    tugas3:data.get('tugas3'), 
                    final:data.get('final')
                }
        }).then( el => {
                res.writeHead(el.status, {
                    'Content-Type' : 'text/html'
                })

                res.end(`<h1>${el.msg}</h1>`)
            }).catch(err => {
                res.writeHead(500, {
                    'Content-Type' : 'text/html'
                })
                res.end(`<h1>Server Error</h1>`)
                
            })
            
        })
    } 
    else {
        res.writeHead(404, {
            'Content-Type' : 'text/html'
        })
        res.write(`<h1> Not found </h1>`)
        res.end()
        
    }
})	
server.listen(3000)
console.log("Running in http://localhost:3000")