import { MermaidSvgExtractor } from "../src/MermaidExtractor"
import fs from 'fs'
import yargs from 'yargs';
import { isEmpty } from "lodash";
import path from "path";

const extractMermaidDiagrams = async () => {

    const { argv } = yargs;
    const filePath = argv['fp'] as string;
    
    if (isEmpty(filePath)) {
        throw new Error('Missing filePath to markdown file --fp');
    }

    const parsedFP = path.parse(filePath)
    const filename = parsedFP.name
    const fileDir = parsedFP.dir
    const tempFilePath = `${fileDir}/temp-${filename}.md`
    const readableFileStream = fs.createReadStream(filePath)
    const writableFileStream = fs.createWriteStream(`${tempFilePath}`,'utf-8')

    const mermaidExtractor = new MermaidSvgExtractor()

    readableFileStream.on('readable',function() {
        let data: Buffer;
        while ((data = this.read(1)) !== null) {
            if(data[0] === 0x60){
                data = Buffer.concat([data,this.read(MermaidSvgExtractor.END_FLAG.length - 1)])
                
                if(mermaidExtractor.isEndOf(data)){
                    mermaidExtractor.write(`./diagrams/${filename}`)
                    writableFileStream.write(`<img src="./diagrams/${filename}.svg">\n`)
                    mermaidExtractor.resetBuffers()
                    mermaidExtractor.inSection = false
                    continue
                }

                data = Buffer.concat([
                    data,
                    this.read(MermaidSvgExtractor.START_FLAG.length - MermaidSvgExtractor.END_FLAG.length)
                ])

                if(mermaidExtractor.isStartOf(data)){
                    mermaidExtractor.inSection = true
                    continue
                }

                writableFileStream.write(data)

            }else{
                if(mermaidExtractor.inSection){
                    mermaidExtractor.push(data)
                }
                else{
                    writableFileStream.write(data)
                }
            }
        }
    })

    readableFileStream.on('end',async() => {
        console.log('renameing file')
        writableFileStream.close()
        await fs.unlinkSync(filePath)
        fs.renameSync(tempFilePath,filePath)
    })

}

(() => extractMermaidDiagrams())()