import fs from 'fs'

const FILENAME ='test'
const DIAGRAM_DIR='./diagrams'

const MERMAID_FLAG_START = Buffer.from([0x60, 0x60, 0x60, 0x6d, 0x65, 0x72, 0x6d, 0x61, 0x69, 0x64])
const MERMAID_FLAG_END = Buffer.from([0x60, 0x60, 0x60])

const extractMermaidDiagrams = async () => {
    const readableFileStream = fs.createReadStream(`${FILENAME}.md`)
    const writableFileStream = fs.createWriteStream(`new-${FILENAME}.md`,'utf-8')

    const MermaidBuffer: Buffer[] = []
    let isMermaid = false

    readableFileStream.on('readable',function() {
        let data: Buffer;
        while ((data = this.read(1)) !== null) {
            if(data[0] === 0x60){
                if(isMermaid){
                    const mermaidFlag = Buffer.concat([data,this.read(2)])
                    isMermaid = !mermaidFlag.equals(MERMAID_FLAG_END)
                    MermaidBuffer.push(mermaidFlag)
                    writableFileStream.write(`<img src="${DIAGRAM_DIR}/${FILENAME}-1.svg">`)
                }else{
                    const mermaidFlag = Buffer.concat([data,this.read(9)])
                    isMermaid = mermaidFlag.equals(MERMAID_FLAG_START)
                    if(isMermaid) MermaidBuffer.push(mermaidFlag)
                }
            }else{
                if(isMermaid){
                    console.log(data)
                    MermaidBuffer.push(data)
                }
                else{
                    writableFileStream.write(data)
                }
            }
        }
    })

    readableFileStream.on('end',async () => {
        if (!await fs.existsSync(DIAGRAM_DIR)) {
            await fs.mkdirSync(DIAGRAM_DIR);
        }
        fs.writeFileSync(`${DIAGRAM_DIR}/${FILENAME}.md`,Buffer.concat(MermaidBuffer),{
            encoding: 'utf-8',
            flag: 'w+'
        })
    })

}

(() => extractMermaidDiagrams())()